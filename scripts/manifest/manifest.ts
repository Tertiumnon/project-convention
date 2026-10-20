// Checks project.yml against the manifest convention and writes store metadata.
// Usage: bun scripts/manifest/manifest.ts <project.yml> <out-dir> [--check-files]
// --check-files also checks that the image files exist and have the right size.
// The metadata layout follows Fastlane's, so its tools can read the output.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

type FileSpec = [string, number];
type Text = Record<string, string>; // language tag -> text
type Permission = { name: string; reason: string };
// Every platform uses the same keys. A platform without settings is written as `web:`.
type PlatformConfig = {
  min_version?: string | number;
  identifier?: string;
  permissions?: Permission[];
  screenshots?: Record<string, string[]>;
  distribution?: string[];
  settings?: Record<string, unknown>;
} | null;
type Compliance = {
  pricing?: string;
  export_compliance?: { uses_encryption?: boolean };
  content_rating?: Record<string, string>;
  target_audience?: string[];
  data_safety?: Record<string, unknown>;
};
type App = {
  type?: string;
  identifier?: string;
  short_name?: string;
  status?: string;
  display_name?: Text;
  summary?: Text;
  description?: Text;
  keywords?: string[];
  categories?: string[];
  languages?: string[];
  default_language?: string;
  rtl_languages?: string[];
  code_languages?: string[];
  url?: string;
  documentation?: string;
  support?: string;
  funding?: string;
  privacy_policy?: string;
  terms_of_service?: string;
  runtime?: string[];
  frameworks?: string[];
  icon?: string;
  social_card?: string;
  screenshots?: string[];
  video?: string;
  data_collected?: string | string[];
  age_rating?: string;
  accessibility?: string;
  audience?: string[];
  entry_point?: string;
  formats?: string[];
};
type Manifest = App & {
  team?: { name: string; roles: string[] }[];
  platforms?: Record<string, PlatformConfig>;
  distribution?: string[];
  environments?: string[];
  // Overrides only. Title, description and short description come from app when not given here.
  store?: Record<string, Text>;
  compliance?: Compliance;
};

const installedPlatforms = ['android', 'ios', 'windows', 'macos', 'linux', 'chromium', 'firefox'];

// Store fields, the file each one becomes, and the length limit in characters.
// Confirmed against the store's own pages: Play short description 80 and full description 4000,
// App Store name 30, subtitle 30, description 4000, promotional text 170.
// Not confirmed: Play title 30, the release notes limits, and iOS keywords 100 (bytes or characters).
const platformFiles: Record<string, Record<string, FileSpec>> = {
  android: {
    title: ['title.txt', 30],
    short_description: ['short_description.txt', 80],
    description: ['full_description.txt', 4000],
    release_notes: ['release_notes.txt', 500],
  },
  ios: {
    title: ['name.txt', 30],
    subtitle: ['subtitle.txt', 30],
    keywords: ['keywords.txt', 100],
    promotional_text: ['promotional_text.txt', 170],
    description: ['description.txt', 4000],
    release_notes: ['release_notes.txt', 4000],
  },
};

const requiredFields: Record<string, string[]> = {
  android: ['title', 'short_description', 'description'],
  ios: ['title', 'description'],
};

const appOf = (m: Manifest): App => m;
const languagesOf = (m: Manifest): string[] => appOf(m).languages ?? [];
const mobilePlatforms = (m: Manifest): string[] => Object.keys(m.platforms ?? {}).filter(p => p in platformFiles);
const ownerName = (m: Manifest): string => m.team?.find(person => person.roles.includes('owner'))?.name ?? '';

// The text a store shows: the store's own override, or the app's text in the same language.
const storeText = (m: Manifest, field: string, language: string): string | undefined => {
  const override = m.store?.[field]?.[language];
  if (override) return override;
  const app = appOf(m);
  const derived: Record<string, Text | undefined> = { title: app.display_name, description: app.description, short_description: app.summary };
  return derived[field]?.[language];
};

const requiredErrors = (m: Manifest): string[] => {
  const app = appOf(m);
  const errors: string[] = [];
  const languages = languagesOf(m);
  if (!app.type) errors.push('type is required');
  if (!app.display_name) errors.push('display_name is required');
  if (!app.summary) errors.push('summary is required');
  if (languages.length === 0) errors.push('languages is required');
  else if (!languages.includes(app.default_language ?? '')) errors.push('default_language must be one of languages');
  for (const language of languages) {
    if (!app.display_name?.[language]) errors.push(`display_name.${language} is missing`);
    if (!app.summary?.[language]) errors.push(`summary.${language} is missing`);
  }
  if (Object.keys(m.platforms ?? {}).length === 0) errors.push('platforms is required');
  if (!m.team?.some(person => person.roles.includes('owner'))) errors.push('team needs one person with the owner role');
  return errors;
};

// Every language key in app text and store overrides must be a language of the app.
const unknownLanguageErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  const languages = languagesOf(m);
  const app = appOf(m);
  for (const field of ['display_name', 'summary', 'description'] as const) {
    for (const language of Object.keys(app[field] ?? {})) {
      if (!languages.includes(language)) errors.push(`${field}.${language} is not in languages`);
    }
  }
  for (const [field, texts] of Object.entries(m.store ?? {})) {
    for (const language of Object.keys(texts)) {
      if (!languages.includes(language)) errors.push(`store.${field}.${language} is not in languages`);
    }
  }
  return errors;
};

const platformErrors = (m: Manifest): string[] => {
  const app = appOf(m);
  const errors: string[] = [];
  const platforms = m.platforms ?? {};
  const names = Object.keys(platforms);
  if (names.some(p => installedPlatforms.includes(p)) && !app.identifier) errors.push('identifier is required for installed platforms');
  if (names.includes('android') && !platforms.android?.min_version) errors.push('platforms.android.min_version is required for android');
  if (names.includes('ios') && !platforms.ios?.min_version) errors.push('platforms.ios.min_version is required for ios');
  for (const [name, config] of Object.entries(platforms)) {
    for (const permission of config?.permissions ?? []) {
      if (!permission.name || !permission.reason) errors.push(`platforms.${name}.permissions needs a name and a reason`);
    }
  }
  const collected = [app.data_collected ?? 'none'].flat();
  const mobile = names.includes('android') || names.includes('ios');
  if ((collected.some(c => c !== 'none') || mobile) && !app.privacy_policy) errors.push('privacy_policy is required for this project');
  return errors;
};

// The store questionnaires need these answers before a mobile app can be submitted.
const complianceErrors = (m: Manifest): string[] => {
  const names = Object.keys(m.platforms ?? {});
  const compliance = m.compliance ?? {};
  const errors: string[] = [];
  if (!names.includes('android') && !names.includes('ios')) return errors;
  if (!compliance.pricing) errors.push('compliance.pricing is required for mobile apps');
  if (!compliance.content_rating || Object.keys(compliance.content_rating).length === 0) errors.push('compliance.content_rating is required for mobile apps');
  if (names.includes('android')) {
    if (!compliance.target_audience?.length) errors.push('compliance.target_audience is required for android');
    if (!compliance.data_safety) errors.push('compliance.data_safety is required for android');
  }
  if (names.includes('ios') && typeof compliance.export_compliance?.uses_encryption !== 'boolean') {
    errors.push('compliance.export_compliance.uses_encryption (true or false) is required for ios');
  }
  return errors;
};

const docTypes = ['guide', 'cookbook', 'style-guide', 'conventions', 'agreement'];

// Doc projects keep their text in content/, and their entry point must exist there.
const docErrors = (m: Manifest, root: string): string[] => {
  const app = appOf(m);
  if (!docTypes.includes(app.type ?? '')) return [];
  const errors: string[] = [];
  if (!app.audience?.length) errors.push('audience is required for doc projects');
  if (!app.entry_point) errors.push('entry_point is required for doc projects');
  else if (!existsSync(join(root, app.entry_point))) errors.push(`entry_point ${app.entry_point} does not exist`);
  if (!existsSync(join(root, 'content'))) errors.push('content/ folder is required for doc projects');
  return errors;
};

const missingErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  for (const platform of mobilePlatforms(m)) {
    for (const field of requiredFields[platform]) {
      for (const language of languagesOf(m)) {
        if (!storeText(m, field, language)) errors.push(`store text ${field}.${language} is missing (${platform})`);
      }
    }
  }
  return errors;
};

const lengthErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  for (const platform of mobilePlatforms(m)) {
    for (const [field, [, limit]] of Object.entries(platformFiles[platform])) {
      for (const language of languagesOf(m)) {
        const text = storeText(m, field, language);
        if (text && text.length > limit) errors.push(`store text ${field}.${language} is longer than ${limit} characters (${platform})`);
      }
    }
  }
  const summaryLimit = 120;
  for (const [language, text] of Object.entries(appOf(m).summary ?? {})) {
    if (text.length > summaryLimit) errors.push(`summary.${language} is longer than ${summaryLimit} characters`);
  }
  return errors;
};

// Settings with defaults: iOS sku is the identifier, and copyright is the owner and the year.
const resolvedSettings = (m: Manifest, platform: string): Record<string, unknown> => {
  const settings: Record<string, unknown> = { ...(m.platforms?.[platform]?.settings ?? {}) };
  if (platform === 'ios') {
    if (settings.sku === undefined) settings.sku = appOf(m).identifier;
    if (settings.copyright === undefined) settings.copyright = `© ${new Date().getFullYear()} ${ownerName(m)}`;
  }
  return settings;
};

const writeMetadata = (m: Manifest, outDir: string): void => {
  for (const platform of mobilePlatforms(m)) {
    mkdirSync(join(outDir, platform), { recursive: true });
    writeFileSync(join(outDir, platform, 'settings.json'), `${JSON.stringify(resolvedSettings(m, platform), null, 2)}\n`);
    for (const language of languagesOf(m)) {
      const dir = join(outDir, platform, language);
      mkdirSync(dir, { recursive: true });
      for (const [field, [file]] of Object.entries(platformFiles[platform])) {
        const text = storeText(m, field, language);
        if (text) writeFileSync(join(dir, file), `${text}\n`);
      }
    }
  }
};

// Image checks, run with --check-files. PNG sizes are read from the header.
type SizeRule = { min?: number; exact?: [number, number] };
const pngSize = (path: string): { width: number; height: number } | null => {
  const data = readFileSync(path);
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};

const imageErrors = (root: string, path: string, rule: SizeRule): string[] => {
  const full = join(root, path);
  if (!existsSync(full)) return [`${path} does not exist`];
  if (!path.endsWith('.png')) return [];
  const size = pngSize(full);
  if (!size) return [`${path} is not a valid PNG`];
  if (rule.exact && (size.width !== rule.exact[0] || size.height !== rule.exact[1])) return [`${path} must be ${rule.exact[0]}x${rule.exact[1]} pixels`];
  if (rule.min && (size.width < rule.min || size.height < rule.min)) return [`${path} must be at least ${rule.min}x${rule.min} pixels`];
  return [];
};

const screenshotPaths = (m: Manifest): string[] => [
  ...(appOf(m).screenshots ?? []),
  ...Object.values(m.platforms ?? {}).flatMap(config => Object.values(config?.screenshots ?? {}).flat()),
];

const fileErrors = (m: Manifest, root: string): string[] => {
  const app = appOf(m);
  const errors: string[] = [];
  const iconRule: SizeRule = Object.keys(m.platforms ?? {}).includes('ios') ? { min: 1024 } : { min: 512 };
  if (app.icon) errors.push(...imageErrors(root, app.icon, iconRule));
  if (app.social_card) errors.push(...imageErrors(root, app.social_card, { exact: [1200, 630] }));
  for (const path of screenshotPaths(m)) errors.push(...imageErrors(root, path, {}));
  const feature = m.platforms?.android?.settings?.feature_graphic;
  if (typeof feature === 'string') errors.push(...imageErrors(root, feature, { exact: [1024, 500] }));
  return errors;
};

const args = process.argv.slice(2);
const checkFiles = args.includes('--check-files');
const [file, outDir] = args.filter(arg => arg !== '--check-files');
if (!file || !outDir) {
  console.error('Usage: bun scripts/manifest/manifest.ts <project.yml> <out-dir> [--check-files]');
  process.exit(2);
}
const manifest = Bun.YAML.parse(readFileSync(file, 'utf8')) as Manifest;
const root = dirname(file);
const errors = [
  ...requiredErrors(manifest),
  ...unknownLanguageErrors(manifest),
  ...platformErrors(manifest),
  ...complianceErrors(manifest),
  ...missingErrors(manifest),
  ...lengthErrors(manifest),
  ...docErrors(manifest, root),
  ...(checkFiles ? fileErrors(manifest, root) : []),
];
if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
writeMetadata(manifest, outDir);
console.log(`Metadata written to ${outDir}`);

// Checks project.yml against the manifest convention and writes store metadata.
// Usage: bun scripts/manifest/manifest.ts <project.yml> <out-dir>
// The metadata layout follows Fastlane's, so its tools can read the output.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

type FileSpec = [string, number];
type Store = Record<string, Record<string, string>>;
// Every platform uses the same keys. A platform without settings is written as `web:`.
type Permission = { name: string; reason: string };
type PlatformConfig = {
  min_version?: string | number;
  identifier?: string;
  permissions?: Permission[];
  screenshots?: Record<string, string[]>;
  distribution?: string[];
  settings?: Record<string, unknown>;
} | null;
type Manifest = {
  type?: string;
  display_name?: string;
  summary?: string;
  identifier?: string;
  languages?: string[];
  default_language?: string;
  platforms?: Record<string, PlatformConfig>;
  team?: { name: string; roles: string[] }[];
  data_collected?: string | string[];
  privacy_policy?: string;
  store?: Store;
  audience?: string[];
  entry_point?: string;
  formats?: string[];
};

const installedPlatforms = ['android', 'ios', 'windows', 'macos', 'linux', 'chromium', 'firefox'];

// Store fields, the file each one becomes, and the length limit in characters.
// Limits are the store rules when this was written. Confirm them before a submission.
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

const requiredErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  if (!m.type) errors.push('type is required');
  if (!m.display_name) errors.push('display_name is required');
  if (!m.summary) errors.push('summary is required');
  else if (m.summary.length > 120) errors.push('summary is longer than 120 characters');
  if (!m.languages?.length) errors.push('languages is required');
  else if (!m.languages.includes(m.default_language ?? '')) errors.push('default_language must be one of languages');
  if (Object.keys(m.platforms ?? {}).length === 0) errors.push('platforms is required');
  if (!m.team?.some(person => person.roles.includes('owner'))) errors.push('team needs one person with the owner role');
  return errors;
};

const platformErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  const platforms = m.platforms ?? {};
  const names = Object.keys(platforms);
  if (names.some(p => installedPlatforms.includes(p)) && !m.identifier) errors.push('identifier is required for installed platforms');
  if (names.includes('android') && !platforms.android?.min_version) errors.push('platforms.android.min_version is required for android');
  if (names.includes('ios') && !platforms.ios?.min_version) errors.push('platforms.ios.min_version is required for ios');
  for (const [name, config] of Object.entries(platforms)) {
    for (const permission of config?.permissions ?? []) {
      if (!permission.name || !permission.reason) errors.push(`platforms.${name}.permissions needs a name and a reason`);
    }
  }
  const collected = [m.data_collected ?? 'none'].flat();
  const mobile = names.includes('android') || names.includes('ios');
  if ((collected.some(c => c !== 'none') || mobile) && !m.privacy_policy) errors.push('privacy_policy is required for this project');
  return errors;
};

const docTypes = ['guide', 'cookbook', 'style-guide', 'conventions', 'agreement'];

// Doc projects keep their text in content/, and their entry point must exist there.
const docErrors = (m: Manifest, root: string): string[] => {
  if (!docTypes.includes(m.type ?? '')) return [];
  const errors: string[] = [];
  if (!m.audience?.length) errors.push('audience is required for doc projects');
  if (!m.entry_point) errors.push('entry_point is required for doc projects');
  else if (!existsSync(join(root, m.entry_point))) errors.push(`entry_point ${m.entry_point} does not exist`);
  if (!existsSync(join(root, 'content'))) errors.push('content/ folder is required for doc projects');
  return errors;
};

const mobilePlatforms = (m: Manifest): string[] => Object.keys(m.platforms ?? {}).filter(p => p in platformFiles);

const unknownLanguageErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  for (const [field, texts] of Object.entries(m.store ?? {})) {
    for (const language of Object.keys(texts)) {
      if (!m.languages?.includes(language)) errors.push(`store.${field}.${language} is not in languages`);
    }
  }
  return errors;
};

const missingErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  const store = m.store ?? {};
  for (const platform of mobilePlatforms(m)) {
    for (const field of requiredFields[platform]) {
      for (const language of m.languages ?? []) {
        if (!store[field]?.[language]) errors.push(`store.${field}.${language} is missing (${platform})`);
      }
    }
  }
  return errors;
};

const lengthErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  for (const platform of mobilePlatforms(m)) {
    for (const [field, texts] of Object.entries(m.store ?? {})) {
      const limit = platformFiles[platform][field]?.[1];
      if (!limit) continue;
      for (const [language, text] of Object.entries(texts)) {
        if (text.length > limit) errors.push(`store.${field}.${language} is longer than ${limit} characters (${platform})`);
      }
    }
  }
  return errors;
};

const writeMetadata = (m: Manifest, outDir: string): void => {
  for (const platform of mobilePlatforms(m)) {
    for (const language of m.languages ?? []) {
      const dir = join(outDir, platform, language);
      mkdirSync(dir, { recursive: true });
      for (const [field, texts] of Object.entries(m.store ?? {})) {
        const spec = platformFiles[platform][field];
        const text = texts[language];
        if (spec && text) writeFileSync(join(dir, spec[0]), `${text}\n`);
      }
    }
  }
};

const [file, outDir] = process.argv.slice(2);
if (!file || !outDir) {
  console.error('Usage: bun scripts/manifest/manifest.ts <project.yml> <out-dir>');
  process.exit(2);
}
const manifest = Bun.YAML.parse(readFileSync(file, 'utf8')) as Manifest;
const errors = [
  ...requiredErrors(manifest),
  ...platformErrors(manifest),
  ...unknownLanguageErrors(manifest),
  ...missingErrors(manifest),
  ...lengthErrors(manifest),
  ...docErrors(manifest, dirname(file)),
];
if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
writeMetadata(manifest, outDir);
console.log(`Metadata written to ${outDir}`);

// Checks project.yml against the manifest convention and writes store metadata.
// Usage: bun scripts/manifest/manifest.ts <project.yml> <out-dir>
// The metadata layout follows Fastlane's, so its tools can read the output.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type FileSpec = [string, number];
type Manifest = {
  type?: string;
  display_name?: string;
  summary?: string;
  identifier?: string;
  languages?: string[];
  default_language?: string;
  platforms?: string[];
  team?: { name: string; roles: string[] }[];
  data_collected?: string | string[];
  privacy_policy?: string;
  android?: { min_sdk?: number };
  ios?: { min_os?: string };
  store?: Record<string, Record<string, string>>;
};

const installedPlatforms = ['android', 'ios', 'windows', 'macos', 'linux', 'chromium', 'firefox'];

// Store text keys, the file each one becomes, and the length limit in characters.
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

const requiredErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  if (!m.type) errors.push('type is required');
  if (!m.display_name) errors.push('display_name is required');
  if (!m.summary) errors.push('summary is required');
  else if (m.summary.length > 120) errors.push('summary is longer than 120 characters');
  if (!m.languages?.length) errors.push('languages is required');
  else if (!m.languages.includes(m.default_language ?? '')) errors.push('default_language must be one of languages');
  if (!m.platforms?.length) errors.push('platforms is required');
  if (!m.team?.some(person => person.roles.includes('owner'))) errors.push('team needs one person with the owner role');
  return errors;
};

const platformErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  const platforms = m.platforms ?? [];
  if (platforms.some(p => installedPlatforms.includes(p)) && !m.identifier) errors.push('identifier is required for installed platforms');
  if (platforms.includes('android') && !m.android?.min_sdk) errors.push('android.min_sdk is required for android');
  if (platforms.includes('ios') && !m.ios?.min_os) errors.push('ios.min_os is required for ios');
  const collected = [m.data_collected ?? 'none'].flat();
  const mobile = platforms.includes('android') || platforms.includes('ios');
  if ((collected.some(c => c !== 'none') || mobile) && !m.privacy_policy) errors.push('privacy_policy is required for this project');
  return errors;
};

const storeErrors = (m: Manifest): string[] => {
  const errors: string[] = [];
  const store = m.store ?? {};
  for (const locale of Object.keys(store)) {
    if (!m.languages?.includes(locale)) errors.push(`store.${locale} is not in languages`);
  }
  for (const platform of (m.platforms ?? []).filter(p => p in platformFiles)) {
    for (const language of m.languages ?? []) {
      errors.push(...entryErrors(platform, language, store[language]));
    }
  }
  return errors;
};

const entryErrors = (platform: string, language: string, entry: Record<string, string> | undefined): string[] => {
  if (!entry) return [`store.${language} is missing for ${platform}`];
  const errors: string[] = [];
  const files = platformFiles[platform];
  for (const key of ['title', 'description']) {
    if (!entry[key]) errors.push(`store.${language}.${key} is missing`);
  }
  for (const [key, value] of Object.entries(entry)) {
    const limit = files[key]?.[1];
    if (limit && value.length > limit) errors.push(`store.${language}.${key} is longer than ${limit} characters (${platform})`);
  }
  return errors;
};

const writeMetadata = (m: Manifest, outDir: string): void => {
  for (const platform of (m.platforms ?? []).filter(p => p in platformFiles)) {
    for (const language of m.languages ?? []) {
      const entry = m.store?.[language] ?? {};
      const dir = join(outDir, platform, language);
      mkdirSync(dir, { recursive: true });
      for (const [key, value] of Object.entries(entry)) {
        const spec = platformFiles[platform][key];
        if (spec) writeFileSync(join(dir, spec[0]), `${value}\n`);
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
const errors = [...requiredErrors(manifest), ...platformErrors(manifest), ...storeErrors(manifest)];
if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
writeMetadata(manifest, outDir);
console.log(`Metadata written to ${outDir}`);

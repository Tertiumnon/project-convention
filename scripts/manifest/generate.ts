// Writes the JSON manifests of each platform from project.yml, after the checks in manifest.ts pass.
// Usage: bun scripts/manifest/generate.ts <project.yml> <out-dir>
// Writes: web/manifest.webmanifest, chromium/manifest.json, firefox/manifest.json,
//         vscode/package.json, npm/package.json. Each file is written only when its platform is set.
// XML and plist formats (Android, iOS, macOS, MSIX, AppStream) are not written here yet.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

type Text = Record<string, string>;
type Permission = { name: string; reason: Text };
type PlatformConfig = {
  min_version?: string | number;
  identifier?: string;
  permissions?: Permission[];
  settings?: Record<string, unknown>;
} | null;
type Manifest = {
  type?: string;
  identifier?: string;
  short_name?: string;
  display_name?: Text;
  summary?: Text;
  categories?: string[];
  languages?: string[];
  default_language?: string;
  rtl_languages?: string[];
  url?: string;
  support?: string;
  icon?: string;
  theme_color?: string;
  background_color?: string;
  keywords?: string[];
  platforms?: Record<string, PlatformConfig>;
  team?: { name: string; roles: string[] }[];
};

const root = (file: string): string => dirname(file);
const textOf = (text: Text | undefined, language: string): string => text?.[language] ?? '';
const ownerName = (m: Manifest): string => m.team?.find(person => person.roles.includes('owner'))?.name ?? '';
const identifierFor = (m: Manifest, platform: string): string | undefined => m.platforms?.[platform]?.identifier ?? m.identifier;
const settingsOf = (m: Manifest, platform: string): Record<string, unknown> => m.platforms?.[platform]?.settings ?? {};

const writeJson = (dir: string, file: string, value: unknown): void => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), `${JSON.stringify(value, null, 2)}\n`);
};

// Reads the pixel size of a PNG from its header. Returns null for other formats.
const pngSize = (path: string): { width: number; height: number } | null => {
  const data = readFileSync(path);
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};

// Icon entries for the web manifest: SVG is "any", PNG uses its real size.
const webIcons = (m: Manifest, root: string): { src: string; sizes: string; type: string }[] => {
  if (!m.icon) return [];
  const full = join(root, m.icon);
  if (extname(m.icon) === '.svg') return [{ src: m.icon, sizes: 'any', type: 'image/svg+xml' }];
  const size = existsSync(full) ? pngSize(full) : null;
  if (!size) throw new Error(`icon ${m.icon} must be an SVG or a PNG that exists`);
  return [{ src: m.icon, sizes: `${size.width}x${size.height}`, type: 'image/png' }];
};

const webManifest = (m: Manifest, root: string): Record<string, unknown> => {
  const lang = m.default_language ?? '';
  const settings = settingsOf(m, 'web');
  return {
    name: textOf(m.display_name, lang),
    short_name: m.short_name ?? textOf(m.display_name, lang),
    description: textOf(m.summary, lang),
    lang,
    dir: (m.rtl_languages ?? []).includes(lang) ? 'rtl' : 'ltr',
    start_url: settings.start_url ?? '/',
    display: settings.display ?? 'standalone',
    orientation: settings.orientation ?? 'any',
    theme_color: m.theme_color,
    background_color: m.background_color,
    categories: m.categories ?? [],
    icons: webIcons(m, root),
  };
};

// Chromium and Firefox extensions use the same manifest.json shape, with different IDs.
const extensionManifest = (m: Manifest, pkg: { version: string }, platform: string): Record<string, unknown> => {
  const lang = m.default_language ?? '';
  const settings = settingsOf(m, platform);
  const permissions = (m.platforms?.[platform]?.permissions ?? []).map(permission => permission.name);
  const manifest: Record<string, unknown> = {
    manifest_version: settings.manifest_version ?? 3,
    name: textOf(m.display_name, lang),
    version: pkg.version,
    description: textOf(m.summary, lang),
    default_locale: lang,
    homepage_url: m.url,
    permissions,
  };
  if (m.icon) manifest.icons = { '128': m.icon };
  if (settings.host_permissions) manifest.host_permissions = settings.host_permissions;
  if (platform === 'chromium' && settings.minimum_chrome_version) manifest.minimum_chrome_version = settings.minimum_chrome_version;
  if (platform === 'chromium' && settings.key) manifest.key = settings.key;
  if (platform === 'firefox') manifest.browser_specific_settings = { gecko: { id: identifierFor(m, 'firefox') } };
  return manifest;
};

// VS Code and npm read package.json. The name must be lowercase with no spaces.
const packageName = (m: Manifest): string => textOf(m.display_name, m.default_language ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const vscodePackage = (m: Manifest, pkg: Record<string, unknown>): Record<string, unknown> => {
  const lang = m.default_language ?? '';
  const settings = settingsOf(m, 'vscode');
  return {
    name: packageName(m),
    displayName: textOf(m.display_name, lang),
    description: textOf(m.summary, lang),
    version: pkg.version,
    publisher: settings.publisher,
    engines: { vscode: settings.engine_vscode ?? '^1.90.0' },
    categories: ['Other'],
    keywords: m.keywords ?? [],
    icon: m.icon,
    repository: pkg.repository,
    license: pkg.license,
    homepage: m.url,
    bugs: m.support,
  };
};

const npmPackage = (m: Manifest, pkg: Record<string, unknown>): Record<string, unknown> => {
  const lang = m.default_language ?? '';
  const settings = settingsOf(m, 'npm');
  return {
    name: settings.name ?? pkg.name,
    version: pkg.version,
    description: textOf(m.summary, lang),
    keywords: m.keywords ?? [],
    license: pkg.license,
    author: ownerName(m),
    homepage: m.url,
    bugs: m.support,
    repository: pkg.repository,
    engines: pkg.engines,
  };
};

const file = process.argv[2];
const outDir = process.argv[3];
if (!file || !outDir) {
  console.error('Usage: bun scripts/manifest/generate.ts <project.yml> <out-dir>');
  process.exit(2);
}
const manifest = Bun.YAML.parse(readFileSync(file, 'utf8')) as Manifest;
const projectRoot = root(file);
const packageFile = join(projectRoot, 'package.json');
if (!existsSync(packageFile)) {
  console.error('package.json is required next to project.yml: the version, license and repository come from it');
  process.exit(1);
}
const pkg = JSON.parse(readFileSync(packageFile, 'utf8')) as Record<string, unknown> & { version: string };
const platforms = Object.keys(manifest.platforms ?? {});

if (platforms.includes('web')) writeJson(join(outDir, 'web'), 'manifest.webmanifest', webManifest(manifest, projectRoot));
if (platforms.includes('chromium')) writeJson(join(outDir, 'chromium'), 'manifest.json', extensionManifest(manifest, pkg, 'chromium'));
if (platforms.includes('firefox')) writeJson(join(outDir, 'firefox'), 'manifest.json', extensionManifest(manifest, pkg, 'firefox'));
if (platforms.includes('vscode')) writeJson(join(outDir, 'vscode'), 'package.json', vscodePackage(manifest, pkg));
if (platforms.includes('npm')) writeJson(join(outDir, 'npm'), 'package.json', npmPackage(manifest, pkg));
console.log(`Manifests written to ${outDir}`);

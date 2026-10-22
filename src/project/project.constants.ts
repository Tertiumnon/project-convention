// Rules copied from README.md. Change them in the same commit as the spec.
export const projectTypes = ['cli', 'library', 'web-app', 'mobile-app', 'desktop-app', 'browser-extension', 'firefox-extension', 'vscode-extension', 'npm-package', 'telegram-sticker-pack', 'cookbook', 'guide', 'style-guide', 'conventions', 'icon-set', 'css-library', 'code-generator', 'agreement']
export const docTypes = ['guide', 'cookbook', 'style-guide', 'conventions', 'agreement']

export const fields = [
  'type', 'slug', 'identifier', 'display_name', 'short_name', 'summary', 'description', 'keywords', 'categories', 'status', 'copyright', 'language',
  'languages', 'default_language', 'rtl_languages', 'code_languages',
  'url', 'documentation', 'support', 'funding', 'privacy_policy', 'terms_of_service', 'deep_links',
  'team', 'frameworks',
  'icon', 'theme_color', 'background_color', 'social_card', 'screenshots', 'video',
  'distribution', 'listed_on', 'environments',
  'data_collected', 'age_rating', 'accessibility',
  'platforms', 'store', 'compliance',
  'audience', 'entry_point', 'formats',
]
export const textFields = ['display_name', 'summary', 'description']
export const baseFields = ['type', 'slug', 'display_name', 'summary', 'team', 'icon']
export const typeFields: Record<string, string[]> = {
  'web-app': ['url', 'languages', 'default_language', 'social_card', 'platforms.web'],
  'mobile-app': ['platforms', 'description', 'privacy_policy', 'compliance'],
  'desktop-app': ['platforms'],
  'browser-extension': ['platforms.chromium.distribution'],
  'firefox-extension': ['platforms.firefox.distribution'],
  ...Object.fromEntries(docTypes.map(type => [type, ['languages', 'default_language', 'audience', 'entry_point']])),
}

export const roles = ['owner', 'maintainer', 'developer', 'designer', 'translator', 'reviewer', 'contributor']
export const platformIds = ['android', 'ios', 'web', 'windows', 'macos', 'linux', 'chromium', 'firefox', 'vscode', 'telegram']
export const installedPlatforms = ['android', 'ios', 'windows', 'macos', 'linux', 'firefox']
export const channels = ['github-releases', 'npm', 'web']
export const stores = ['google-play', 'app-store', 'chrome-web-store', 'firefox-addons', 'microsoft-store', 'mac-app-store', 'flathub']

export const commonFiles = ['README.md', 'LICENSE', 'CHANGELOG.md', '.gitignore']
export const docsFiles = ['docs/INSTALL.md', 'docs/USAGE.md', 'docs/DEVELOPMENT.md', 'docs/PUBLISH.md']
export const logoFiles = ['assets/logo/logo.svg', 'assets/logo/logo.png']
export const screenshotTypes = ['mobile-app', 'desktop-app', 'browser-extension']

export const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
export const firefoxIdPattern = /^(\{[0-9a-f-]{36}\}|[^@\s]+@[^@\s]+)$/i

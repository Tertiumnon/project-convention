# Project Structure Convention

Standard layout, files and GitHub metadata for Tertium projects.

Built on [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

Read **Common** and your type's section. The type is `type` in `project.yml`:

- [Doc project](#doc-project): `guide`, `cookbook`, `style-guide`, `conventions`, `agreement`
- [Browser extension](#browser-extension): `browser-extension`, `firefox-extension`
- [Web app](#web-app): `web-app`
- [Mobile app](#mobile-app): `mobile-app`
- [Desktop app](#desktop-app): `desktop-app`
- Others (`cli`, `library`, `npm-package`, `vscode-extension`, `telegram-sticker-pack`, `icon-set`, `css-library`, `code-generator`): Common only, plus the assets that match their kind.

---

## Common

### Files

| File | Required | Contents |
| --- | --- | --- |
| `README.md` | yes | Title, summary, description with screenshots. See README. |
| `LICENSE` | yes | MIT unless the project has its own terms. See Licence. |
| `CHANGELOG.md` | yes | Version history. See Changelog. |
| `project.yml` | yes | Project attributes. See Project attributes. |
| `.gitignore` | yes | Ignores `build/` and `dist/`. |
| Ecosystem manifest (`package.json`, `Cargo.toml`, `manifest.json`, ...) | yes | Version, licence, repository and the tool's own settings. |
| `docs/INSTALL.md` | yes, except doc projects | Installing, or building from source, with requirements. |
| `docs/USAGE.md` | yes, except doc projects | Commands, options, screens and workflows. |
| `docs/DEVELOPMENT.md` | yes, except doc projects | Scripts, tests, project layout and contributor notes. |
| `docs/PUBLISH.md` | yes, except doc projects | Releasing and publishing, store listing and review details, permission reasons. |
| `docs/screenshots/NN-short-name.png` | yes for `mobile-app`, `desktop-app`, `browser-extension`; recommended otherwise | Screenshots. See Screenshots and social preview. |
| `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` | no | Only when the project has them. |
| Other `docs/*.md` | no | Architecture, decisions. Working notes for developers and agents, not product documentation. |

Anything a tool does not need at the root goes into a folder. The default branch is `main`.

### Folders

| Folder | Contents |
| --- | --- |
| `src/` | Source code, nothing generated. Monorepos use `packages/` or `apps/`. |
| `test/` or `tests/` | Automated tests. One name per project. |
| `scripts/` | Build and release scripts. |
| `data/` | Structured data the project reads or writes: JSON, YAML, CSV. Not prose. |
| `content/` | Product documentation: guides, cheatsheets, cookbooks. Doc projects only. |
| `assets/` | Static binary files. See Assets. |
| `public/` | Files served as they are from the site root. Web apps only. |
| `build/` | Intermediate build output, such as compiled files. Git-ignored. |
| `dist/` | Final artifacts ready to publish: bundles, installers, packages. Git-ignored. |

A project adds folders only for its own purpose, such as `packages/` for a monorepo.

### Naming by ecosystem

Folder names are lowercase by default. An ecosystem may name folders its own way; the project follows it for folders only.

| Ecosystem | Folders |
| --- | --- |
| Default | `docs/`, `assets/`, `scripts/` |
| C# and .NET | `Docs/`, `Assets/`, `Scripts/`, `Docs/Screenshots/` |

File names keep the names in Files, and tool files keep theirs (`.csproj`, `Cargo.toml`, `package.json`).

### Assets

`assets/` holds static binary files: images, icons, fonts, store and sticker images. Text files (JSON, YAML, Markdown) do not belong there. Names are lowercase, hyphenated, with no spaces, unless the ecosystem says otherwise.

| Folder | Holds |
| --- | --- |
| `assets/logo/` | Required. `logo.svg` or `logo.png`: square, at least 1024 by 1024 pixels. |
| `assets/icons/` | Icons the project uses. Desktop apps: the sizes each platform requires. Browser extensions: 16, 48 and 128 pixel PNGs. |
| `assets/images/` | Other images. |
| `assets/fonts/` | Fonts. |
| `assets/store/<platform>/` | Store listing images, for example `assets/store/android/`, `assets/store/windows/`, `assets/store/chrome/`. |
| `assets/stickers/` | Sticker pack images. Sticker packs only. |

### README

The README is for people who use the project, and listings show it as the project page. It holds only:

1. **Title**: level-1 heading with the display name (see Names).
2. **Summary**: one line, the same as the GitHub description and `summary` in `project.yml`.
3. **Description**: what the project does, with screenshots from `docs/screenshots/` between `<!-- screenshots -->` and `<!-- /screenshots -->`.

A command-line tool may add a **Usage** section after the description: its main commands and one example. The full reference is `docs/USAGE.md`.

No other sections, and no sections that only point to other files. Installing, usage and publishing live in their `docs/` files. A doc project with no `content/` is the exception: see Doc project.

### Changelog

- [Keep a Changelog](https://keepachangelog.com/) format, newest release first.
- Pending changes go under `## [Unreleased]`. Each release gets `## X.Y.Z - YYYY-MM-DD`, matching tag `vX.Y.Z`.
- Entries are written by hand under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` and `Security`, or generated from commits. A generated changelog is not edited by hand.

### Versions and releases

- Semantic Versioning. Pre-releases such as `-rc.1` are not marked as the latest version.
- A release bumps the manifest version, creates tag `vX.Y.Z` on `main`, and pushes both.
- Patches are small commits on `main`.
- Each tag has a GitHub Release whose body is its changelog section.
- Release attachments depend on the type. A web app is deployed, not released as files.

#### Release scripts

Projects with a `package.json` have `release:patch`, `release:minor`, `release:major` and `version` scripts, named and run as in the npm convention.

### Screenshots and social preview

- **Screenshots**: `docs/screenshots/NN-short-name.png`, numbered in display order, at most 1280 pixels wide.
- **Social preview** (the GitHub repository image): 1280 by 640 pixels, set in GitHub's repository settings, not stored in the repository.

### Store assets

Store assets are required before submitting. Check each store's current rules first. Values were checked when this guide was written.

| Store | Asset | Requirement | Status |
| --- | --- | --- | --- |
| Microsoft Store (Windows) | Store logo | Required in the submission FAQ, optional on the listing page. Confirm in Partner Center. | Conflicting sources |
| Microsoft Store (Windows) | Screenshots | PNG up to 50 MB, desktop at 1366 x 768 or larger. | Verified; counts conflict |
| Microsoft Store (Windows) | Privacy policy URL | Required when the app collects or transmits personal information. | Verified |
| Mac App Store (macOS) | App icon | 1024 x 1024 pixels. | Confirm in App Store Connect |
| Mac App Store (macOS) | Screenshots | Not confirmed. | To verify |
| Google Play (Android) | App icon | 512 x 512, 32-bit PNG with alpha, up to 1024 KB. | Verified by secondary sources |
| Google Play (Android) | Feature graphic | 1024 x 500, JPEG or 24-bit PNG without alpha. | Verified |
| Google Play (Android) | Screenshots | JPEG or 24-bit PNG without alpha, 320 to 3840 px, longest side at most twice the shortest. At least 2. | Partly verified |

### Project attributes

`project.yml` at the root holds the facts that GitHub, the ecosystem manifest and the store listings do not hold.

- Full reference with placeholders: `project--example.yml`.
- Per platform: `project--example--<platform>.yml` (android, ios, web, windows, macos, linux, chromium, firefox, vscode, telegram).
- Cross-platform desktop app: `project--example--crossplatform.yml`. Command-line tool: `project--example--cli.yml`. Doc project: `project--example--guide.yml`.

Not repeated in `project.yml`: `version`, `license`, `repository` and `engines` in `package.json` (or `manifest.json` for extensions). Tools read them there.

Required means required for every project unless the type notes say otherwise.

#### Identity

| Field | Required | Meaning |
| --- | --- | --- |
| `type` | yes | One of: `cli`, `library`, `web-app`, `mobile-app`, `desktop-app`, `browser-extension`, `firefox-extension`, `vscode-extension`, `npm-package`, `telegram-sticker-pack`, `cookbook`, `guide`, `style-guide`, `conventions`, `icon-set`, `css-library`, `code-generator`, `agreement`. |
| `slug` | yes | Lowercase, hyphenated ID, unique among the owner's projects, for example `pumpkin-timer`. Catalogues use it in URLs. Usually the repository name. Never changes once listed. |
| `identifier` | with an installed platform (`android`, `ios`, `windows`, `macos`, `linux`, `firefox`), unless each sets its own | Reverse-DNS name, for example `com.tertium.pumpkintimer`. Default for every platform; a platform can override it with `platforms.<id>.identifier`. Use a domain the team owns; GitHub projects use `io.github.<owner>.<app>`, which Flathub accepts. Fix it before the first store upload: Android and iOS identifiers cannot change later. |
| `display_name` | yes | Map of language to the name people see: store title and README title. |
| `short_name` | no | One short word. For a CLI, the command name. |
| `summary` | yes | Map of language to one sentence, up to 120 characters. Default language: the GitHub description. Android short description. |
| `description` | for stores | Map of language to the long text. Store description. |
| `keywords` | no | Search keywords, lowercase. |
| `categories` | yes for `ios`; no otherwise | One or more of: `entertainment`, `games`, `lifestyle`, `productivity`, `social`, `utilities`, `developer-tools`, `education`, `health`, `music`, `photo`, `travel`, `finance`, `news`, `sports`, `shopping`, `business`, `reference`. The first is the primary store category; the App Store also takes the second as its secondary category. Each store's field is in Mapping. |
| `status` | no | `alpha`, `beta`, `stable`, `maintenance` or `archived`. |
| `copyright` | no | For example `© 2026 Tertium`. Used by iOS, macOS and Windows; the App Store takes it as its copyright line. Not localized. |
| `language` | no | Only when GitHub's detected language is wrong, for example `Markdown`. |

Text fields are language maps with the same keys as `languages`, even with one language: `display_name: { en: Pumpkin Timer }`.

#### Languages

| Field | Required | Meaning |
| --- | --- | --- |
| `languages` | yes, with a user interface or product documentation | BCP 47 tags of every language, for example `en`, `pt-BR`. |
| `default_language` | yes, when `languages` is set | Used when the reader's language is not listed. |
| `rtl_languages` | no | The `languages` written right to left. |
| `code_languages` | no | Programming languages, for example `TypeScript`. Not spoken languages. |

#### Links

| Field | Required | Meaning |
| --- | --- | --- |
| `url` | web apps with a site | Public home page, absolute `https` URL. |
| `documentation` | no | Documentation URL. |
| `support` | no | Issue tracker, forum or contact page. |
| `funding` | no | Donation or sponsorship URL. |
| `privacy_policy` | yes when `data_collected` is not `none`; always for Android and iOS | Absolute URL. |
| `terms_of_service` | no | Absolute URL. |
| `deep_links` | mobile apps that open links | `scheme` (custom URL scheme), `hosts` (domains for Android app links and iOS universal links), `paths` (for example `/card`). |

Prefer a URL over an email address.

#### People

| Field | Required | Meaning |
| --- | --- | --- |
| `team` | yes | People who work on the project: `name`, `roles`, optional `github` (login), `url`, `languages`. |
| `team[].roles` | yes | One or more of: `owner`, `maintainer`, `developer`, `designer`, `translator`, `reviewer`, `contributor`. |
| `team[].languages` | translators | BCP 47 tags from `languages` the person translates into. |

- The `owner` is the `author` in `package.json`.
- No email addresses in `team`. Use `github` or `url`.
- Names in examples are placeholders.

#### Technology

| Field | Required | Meaning |
| --- | --- | --- |
| `frameworks` | no | By name, for example `Angular`, `React`, `SolidJS`. |

#### Media

| Field | Required | Meaning |
| --- | --- | --- |
| `icon` | yes | Path to a square SVG, or PNG at least 1024 by 1024 pixels. Each platform's sizes are generated from it. |
| `theme_color` | no | Hex colour, for example `#17120f`. Web manifest, Android splash, Windows tiles. |
| `background_color` | no | Hex colour behind the icon at launch. Web manifest, Windows tiles. |
| `social_card` | web apps | Share image, 1200 by 630 pixels, served as `/social-card.png`. |
| `screenshots` | no | Paths from `docs/screenshots/`, in display order. |
| `video` | no | URL of a demonstration video. |

#### Distribution

| Field | Required | Meaning |
| --- | --- | --- |
| `distribution` | no | Channels not tied to one platform: `github-releases`, `npm`, `web`. Stores go in `platforms.<id>.distribution`. |
| `listed_on` | no | Absolute `https` URLs of the catalogues that list this project, for example a personal or team site. Each project names only its own catalogues. Channels that deliver the app go in `distribution`. |
| `environments` | no | Deployment environments, for example `dev` and `prod`. Never host names. |

#### Privacy and content

| Field | Required | Meaning |
| --- | --- | --- |
| `data_collected` | yes, for stores | `none`, or a list. Each item has a `type`: `contact`, `location`, `identifiers`, `usage`, `diagnostics`, `content`, `health`, `financial`, `search`, `browsing`, `other`. Optional: `purposes`, `linked` (tied to the user), `tracking` (used across other companies' apps and sites). Feeds the App Store privacy labels and the Google Play data-safety form. |
| `age_rating` | no | `everyone`, `teen` or `mature`. |
| `accessibility` | no | Standard the project is tested against, for example `WCAG 2.2 AA`. Only when tested. |

#### Platforms

`platforms` is a map. Every platform uses the same keys, so a generator reads any platform the same way.

| Key | Required | Meaning |
| --- | --- | --- |
| `min_version` | yes for `android` and `ios`; optional otherwise | Lowest version. Android: API level as an integer (`minSdkVersion`). iOS: OS version as a string (`MinimumOSVersion`). Chromium: browser version as a string. VS Code: editor version as a string, written as `^<version>`. |
| `identifier` | no | Overrides the top-level `identifier`. Used by Android and iOS as application and bundle ID, and by iOS as the default SKU. Chromium's ID comes from the store unless `key` is set. Firefox (`browser_specific_settings.gecko.id`) needs a GUID or an email-like ID, for example `pumpkin-timer@johndoe.example`, not reverse-DNS. |
| `permissions` | no | List of `name` and `reason`. Android: the permission. iOS: the `Info.plist` usage-description key. `reason` is a language map. |
| `screenshots` | yes for stores | Map of device class to paths in `docs/screenshots/`. |
| `distribution` | no | Stores for this platform: `google-play`, `app-store`, `chrome-web-store`, `firefox-addons`, `microsoft-store`, `mac-app-store`, `flathub`. |
| `settings` | no | Settings only that platform has. |

A platform with no settings is written as `web:` with nothing after it.

#### Platform settings

| Platform | Settings |
| --- | --- |
| `web` | `start_url` (default `/`), `display` (`standalone`, `fullscreen`, `minimal-ui` or `browser`; default `standalone`), `orientation`. |
| `chromium` | `manifest_version` (3), `host_permissions` (URL patterns), `key` (only for a fixed extension ID). |
| `firefox` | `manifest_version`. |
| `vscode` | `publisher` (Marketplace publisher). |
| `linux` | `package_formats` (`AppImage`, `flatpak`), `runtime` (for example `org.freedesktop.Platform`). |
| `windows` | `installer` (for example `msix`), `publisher` (certificate subject, for example `CN=Tertium`, must match the signing certificate). The MSIX version is `Major.Minor.Build.Revision`, padded with `.0`. |
| `macos` | `notarized` (`true` or `false`). |
| `telegram` | `set_name` (the pack's short name in its `t.me/addstickers/` link). |
| `android`, `ios` | See Android and iOS. |

#### Android

For `mobile-app` projects shipped to Google Play.

| Field | Required | Meaning |
| --- | --- | --- |
| `platforms.android.min_version` | yes | Lowest API level, as an integer, for example `26`. |
| `platforms.android.screenshots` | yes | `phone` (at least two), optionally `tablet_7` and `tablet_10`. |
| `platforms.android.settings.target_version` | no | API level built for. Default: the newest level the store accepts. |
| `platforms.android.settings.feature_graphic` | no | 1024 by 500 pixels, in `assets/store/android/`. |

#### iOS

For `mobile-app` projects shipped to the App Store.

| Field | Required | Meaning |
| --- | --- | --- |
| `platforms.ios.min_version` | yes | Lowest iOS version, as a string, for example `"16.0"`. |
| `platforms.ios.permissions` | when the app asks for one | `name` is an `Info.plist` key, for example `NSCameraUsageDescription`. |
| `platforms.ios.screenshots` | yes | Device classes `iphone_6_9` and `ipad_13`, each with paths. |
| `platforms.ios.settings.sku` | no | App Store Connect identifier. Default: the iOS `identifier`. |

#### Store listing

Store text comes from the app fields. Write a store entry only when a store needs different text, under `store`, one entry per field, each a language map.

| Store text | Taken from | Android file | iOS file | Limit (characters) |
| --- | --- | --- | --- | --- |
| `title` | `display_name` | `title.txt` | `name.txt` | 30 |
| `short_description` | `summary` | `short_description.txt` | not used | 80 |
| `description` | `description` | `full_description.txt` | `description.txt` | 4000 |
| `subtitle` | `store.subtitle` only | not used | `subtitle.txt` | 30 |
| `keywords` | `store.keywords` only | not used | `keywords.txt` | 100 (bytes or characters: not confirmed) |
| `promotional_text` | `store.promotional_text` only | not used | `promotional_text.txt` | 170 |
| `release_notes` | `store.release_notes` only | `release_notes.txt` | `release_notes.txt` | 500 Android, 4000 iOS (not confirmed) |

```yaml
display_name:
  en: Pumpkin Timer
  fr: Minuteur Citrouille
store:
  subtitle:
    en: Halloween countdown timer
```

- Every language in `languages` needs `display_name`, `summary` and `description` for each mobile platform.
- A store override for a language not in `languages` is an error.
- Confirmed limits: Google Play title 30, short description 80, full description 4000; App Store name 30, subtitle 30, description 4000, promotional text 170.
- Unconfirmed: release-notes limits, iOS keywords (100). Confirm in the consoles before submitting.

#### Compliance

Store form answers, kept in one place.

| Field | Required | Meaning |
| --- | --- | --- |
| `compliance.pricing` | mobile apps | `free` or `paid`. |
| `compliance.export_compliance.uses_encryption` | iOS | `true` or `false`. |
| `compliance.content_rating` | mobile apps | Each key is a questionnaire question, each value the answer: `true`, `false` or a word such as `none`. |
| `compliance.target_audience` | Google Play | Audiences, for example `all ages`. |
| `compliance.data_safety` | Google Play | `collects`, `shares` and `deletion_request_url`, as the Play form asks. |

#### Type notes

- **`web-app`**: requires `url`, `languages`, `default_language`, `social_card`, `platforms: web`.
- **`mobile-app`**: requires `identifier`, `platforms` (`android`, `ios` or both), `display_name`, `summary`, `description`, `privacy_policy`, `compliance`, and `min_version` on each platform.
- **`desktop-app`**: requires `platforms` and `icon`.
- **`browser-extension`** and **`firefox-extension`**: require `platforms.chromium` or `platforms.firefox` respectively, with a store in its `distribution`. `manifest.json` holds the version, name and icons.
- **Doc projects**: require `languages`, `default_language`, `audience` and `entry_point`; `platforms: web` when published as a site.

#### What reads the manifest

| Consumer | Reads |
| --- | --- |
| Web app manifest (`manifest.webmanifest`) | `display_name`, `short_name`, `summary`, `languages`, `icon` |
| Page metadata and JSON-LD | `display_name`, `summary`, `url`, `languages`, `default_language`, `social_card`, `license` from `package.json` |
| Language switcher | `languages`, `default_language`, `rtl_languages` |
| Store metadata (generated) | `display_name`, `summary`, `description`, `store`, `languages`, `platforms`, `privacy_policy` |
| Store listings | `display_name`, `summary`, `categories`, `privacy_policy`, `data_collected`, `age_rating`, `screenshots` |

#### Mapping

Where each field goes in each native manifest or store form. Each cell must be confirmed from the native documentation before a generator relies on it. Empty cells: the format has no such field.

| Field | Android | iOS | Web manifest | Chromium / Firefox | macOS | Windows (MSIX) | Linux (AppStream) | VS Code / npm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `identifier` | `applicationId` | `CFBundleIdentifier` | | Firefox `gecko.id` | `CFBundleIdentifier` | `Identity Name` | `id` | |
| `display_name` | app label | `CFBundleDisplayName` | `name` | `name` | `CFBundleDisplayName` | `DisplayName` | `name` | `displayName` |
| `short_name` | | | `short_name` | | | | | |
| `summary` | short description | | `description` | `description` | | `Description` | `summary` | `description` |
| `description` | full description | description | | | | | `description` | `description` (npm) |
| `version` | `versionName` | `CFBundleShortVersionString` | | `version` | `CFBundleShortVersionString` | `Version` | `releases` | `version` |
| `min_version` | `minSdkVersion` | `MinimumOSVersion` | | `minimum_chrome_version` | `LSMinimumSystemVersion` | `MinVersion` | | `engines.vscode` |
| `icon` | launcher icon (mipmap densities) | app icon set (1024) | `icons` | `icons` (16, 48, 128) | `.icns` | logo set | `icon` (64, 128) | `icon` (128) |
| `theme_color` | splash theme | | `theme_color` | | | `BackgroundColor` tile | | |
| `background_color` | splash background | | `background_color` | | | `BackgroundColor` tile | | |
| `copyright` | | `NSHumanReadableCopyright` | | | `NSHumanReadableCopyright` | | | |
| `permissions` | `uses-permission` | usage-description keys | | `permissions`, `host_permissions` | entitlements | capabilities | | |
| `languages` | resource locales | `CFBundleLocalizations` | `lang` | | `CFBundleLocalizations` | resource languages | `languages` | |
| `default_language` | default locale | `CFBundleDevelopmentRegion` | `lang` | `default_locale` | `CFBundleDevelopmentRegion` | `DefaultLanguage` | | |
| `url` | | marketing URL | | `homepage_url` | | | `url` | `homepage` (npm) |
| `support` | support URL | support URL | | | | | | `bugs` (npm) |
| `privacy_policy` | privacy policy URL | privacy policy URL | | | | | | |
| `categories` | category | primary and secondary category (App Store Connect) | | | `LSApplicationCategoryType` | | `categories` | `categories` |
| `keywords` | | | | | | | `keywords` | `keywords` |
| `data_collected` | data safety form | privacy labels | | | | | | |
| `deep_links` | app links (`assetlinks.json`) | universal links, URL schemes | | | URL types | protocol activation | | |
| `team` (owner) | | | | `author` | | publisher name | `developer` | `author` (npm) |
| `license` | | | | | | | `project_license` | `license` |
| `engines` | | | | | | | | `engines` (npm) |

Each store names its categories its own way (Google Play `TOOLS`, App Store `Utilities`, macOS `public.app-category.utilities`). Check each `categories` value against the store's list before a release. iOS keywords come from `store.keywords` (see Store listing).

`version`, `license` and `engines` come from the ecosystem file. Build numbers (`versionCode`, the MSIX four-part version) are set at build time.

### Repository metadata

- **Description**: one sentence, up to 120 characters.
- **Topics**: for discovery. The project type belongs in `project.yml`, not in topics.
- **Website**: the homepage URL, when there is one.
- **Language**: GitHub detects it. Code samples in a documentation repository are marked in `.gitattributes`, for example `*.php linguist-documentation`.

### Names

| Name | Form | Example | Used for |
| --- | --- | --- | --- |
| Repository name | Lowercase, hyphenated | `portal-commander-file-manager-community` | GitHub URL, folder name, release tags |
| Display name | Capitals and spaces | `Portal Commander` | README title, documentation |
| Short name | One word, lowercase, optional | `pumpkin` | Command names, mentions |

- The display name is the first heading of `README.md`. A scoped npm package keeps its scope: `@tertium/pumpkin`.
- A CLI tool's short name is its command name. Do not reuse another project's command or package name.

### Licence

- Open-source projects use MIT unless there is a reason for another. `LICENSE` is required.
- Projects with their own terms (for example, personal use only) state them in `LICENSE`.
- Creative assets, such as sticker packs, can use CC BY 4.0, with attribution in the description.

---

## Doc project

For `guide`, `cookbook`, `style-guide`, `conventions` and `agreement`. The Markdown files are the product.

- `content/` holds the documentation, organised by topic, written for readers.
- A project whose whole product fits in `README.md` has no `content/`: the README holds the documentation in any sections it needs, and `entry_point` is `README.md`.
- Links inside `content/` are relative to the file that contains them.
- No `src/` or `dist/` unless the project ships a tool or a generated artifact.

| Field | Required | Meaning |
| --- | --- | --- |
| `audience` | yes | Short labels, for example `parents`, `developers`, `translators`. |
| `entry_point` | yes | First page a reader opens: a file inside `content/`, for example `content/README.md`, or `README.md` when there is no `content/`. The file must exist. |
| `formats` | no | `markdown`, `html`, `pdf`. |

---

## Browser extension

For `browser-extension` (Chromium) and `firefox-extension`. Store rules change, so check them before each submission.

- `manifest.json` at the root. Its `name`, `version` and `icons` match the repository.
- `assets/icons/`: 16, 48 and 128 pixel PNGs referenced by the manifest.
- `assets/store/<browser>/`: store listing images.
- `dist/`: the packaged `.zip` (Chromium) or `.xpi` (Firefox), attached to the GitHub Release.
- Permissions are the minimum the extension needs. `docs/PUBLISH.md` names each one and its reason.

---

## Web app

For `web-app`. A web app has `public/`, a web manifest, a sitemap and a share image. Desktop and mobile rules do not apply.

### public/

`public/` holds files served as they are from the site root. `public/robots.txt` is served at `/robots.txt`.

| File | Served at | Required | Purpose |
| --- | --- | --- | --- |
| `favicon.ico` | `/favicon.ico` | yes | Real icon file. Browsers request this path by default. |
| `favicon.svg` | `/favicon.svg` | recommended | Scalable icon for modern browsers. |
| `apple-touch-icon.png` | `/apple-touch-icon.png` | yes | 180 by 180 pixels, iOS home screen. |
| `icons/icon-192.png`, `icons/icon-512.png` | `/icons/...` | yes | Referenced by the manifest. |
| `manifest.webmanifest` | `/manifest.webmanifest` | yes | Name, colours, `display`, icons. |
| `robots.txt` | `/robots.txt` | yes | Crawl rules and sitemap location. |
| `social-card.png` | `/social-card.png` | yes | Share image, 1200 by 630 pixels. |

- A missing file returns a real 404, not the app shell with status 200. Crawlers would index every unknown URL.
- `<head>` links `<link rel="icon">`, `<link rel="apple-touch-icon">` and `<link rel="manifest">`.
- `manifest.webmanifest` sets `display` from `platforms.web.settings.display`, and `theme_color` and `background_color`.

### robots.txt

- `User-agent: *` and `Allow: /` for a public site.
- A `Sitemap:` line with the same absolute `https` origin as the pages.
- Pages not meant for search are `noindex` in the page itself. `robots.txt` cannot hide them, since a blocked page cannot be seen to carry `noindex`.

### Absolute URLs

- Canonical, `og:url`, `og:image` and `twitter:image` are absolute `https` URLs built from `url` in `project.yml`, not from request headers, which clients can forge.

### Sitemap and languages

- `/sitemap.xml` lists every language URL, with `xhtml:link` alternates for all languages and `x-default`.
- Each page sets `<html lang>`, has `hreflang` alternates and `x-default`, and sets `og:locale` with `og:locale:alternate` for the others.
- Pages with personal content (for example, a card sent to someone) are `noindex,follow` and send `Referrer-Policy: no-referrer`.

### Previews and structured data

- `og:title`, `og:description`, `og:image` and `og:image:alt` are translated per language. `twitter:card` is `summary_large_image`.
- A JSON-LD block (`WebApplication`) with `inLanguage` on each language page.
- Check the live page with the Facebook Sharing Debugger and Telegram's preview before calling it done.

---

## Mobile app

For `mobile-app`: Android and iOS apps shipped through the stores. Web and desktop apps follow their own sections.

- `identifier` is the Android application ID and the iOS bundle ID.
- Store text, screenshot paths and compliance answers live in `project.yml` (see Project attributes). Do not type them into store forms by hand.
- Store builds (`.aab` for Google Play, `.ipa` for the App Store) go to the stores. They are attached to the GitHub Release only when the project publishes them directly.
- Listing images: `assets/store/android/` and `assets/store/ios/`. Requirements are in Store assets.

---

## Desktop app

For `desktop-app`: native apps packaged per platform.

- Platform builds in `dist/` (`.exe`, `.msi`, `.dmg`, `.AppImage`, and so on), attached to the GitHub Release.
- Icon in `assets/icons/`, in the sizes each platform requires.
- Listing images in `assets/store/<platform>/`, for example `assets/store/windows/`, `assets/store/macos/`. Requirements are in Store assets.

---

## Checking a project

- `bunx project-convention check [projectPath]` checks `project.yml` and the required files, prints each problem and exits with 1 when there is one. It needs Bun.
- It does not check image sizes, store text limits, README sections or the ecosystem manifest.

---

## Changes to this guide

Changes are listed in [CHANGELOG.md](CHANGELOG.md).

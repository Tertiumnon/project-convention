# Project Structure Convention

How to lay out a software project and its GitHub repository, so that every project looks the same to the people who read it and to the tools that build, release and list it.

The guide builds on [Standard Readme](https://github.com/RichardLitt/standard-readme) for the README, [Keep a Changelog](https://keepachangelog.com/) for the changelog, [Semantic Versioning](https://semver.org/) for versions.

The guide has one **Common** section, which applies to every project, and one section per project type. Find your project type in `project.yml` (see Project attributes) and read the Common section plus that type's section:

- [Doc project](#doc-project): `guide`, `cookbook`, `style-guide`, `conventions`, `agreement`
- [Browser extension](#browser-extension): `browser-extension`, `firefox-extension`
- [Web app](#web-app): `web-app`
- [Mobile app](#mobile-app): `mobile-app`
- [Desktop app](#desktop-app): `desktop-app`

Other types (`cli`, `library`, `npm-package`, `vscode-extension`, `telegram-sticker-pack`, `icon-set`, `css-library`, `code-generator`) use the Common section only, plus the Assets subfolders that match their kind.

---

## Common

### Root

The root holds these files:

- `README.md`: what the project is and how to use it.
- `CHANGELOG.md`: version history.
- `LICENSE`: required.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`: when the project has them.
- The manifest and configuration files its tools require, for example `package.json`, `Cargo.toml`, `manifest.json` or `.gitignore`.

Anything a tool does not need at the root goes into a folder. The default branch is `main`.

### Folders

| Path | Contents |
| --- | --- |
| `src/` | Source code. Monorepos use `packages/` or `apps/` instead. |
| `test/` or `tests/` | Automated tests. Use one name per project. |
| `content/` | Documentation as the product: guides, cheatsheets, cookbooks. Doc projects only. See Doc project. |
| `docs/` | Notes about building and maintaining the project. See Documentation. Screenshots go in `docs/screenshots/`. |
| `data/` | Structured data the project reads or writes, such as JSON, YAML or CSV. Not prose. |
| `scripts/` | Build and release scripts. |
| `assets/` | Static binary files. See Assets. |
| `public/` | Files served as they are from the site root. Web apps only. See Web app. |
| `build/` or `dist/` | Generated output. See Source and build output. |

A folder is named for what it contains. A project adds folders only for its own purpose, such as `packages/` for a monorepo.

### Documentation

- `docs/` holds notes about the project itself: architecture, decisions, contributor notes. AI agents and developers use it as working memory, so it is not the place for product documentation.
- A project with no working notes has no `docs/` folder.
- Product documentation goes in `content/`, and only doc projects have it (see Doc project).

### Source and build output

- `src/` holds the source code, and nothing generated.
- Generated output goes into exactly one folder per project:
  - `build/` for intermediate output from the build, such as compiled files.
  - `dist/` for final artifacts ready to publish, such as bundles, installers and packages.
- Both are listed in `.gitignore` and not committed.

### Assets

`assets/` holds the static binary files that the project or its listings use: images, icons, fonts, and store and sticker images.

- Sort files into subfolders by kind:
  - `assets/logo/`: the logo, `logo.svg` or `logo.png`. Square, at least 512 by 512 pixels.
  - `assets/icons/`: icons used by the project.
  - `assets/images/`: other images.
  - `assets/fonts/`: fonts.
  - `assets/store/<platform>/`: store listing images. See Desktop app and Browser extension.
  - `assets/stickers/`: sticker pack images (sticker packs only).
- File and folder names are lowercase, hyphenated, with no spaces.
- Text files, such as JSON, YAML or Markdown, do not belong in `assets/`.

### README

Sections, in this order:

1. **Title**: a level-1 heading with the display name (see Names).
2. **Description**: one line, the same text as the GitHub repository description.
3. **Screenshots**: images from `docs/screenshots/`, with relative paths.
4. **Install**.
5. **Usage**.
6. **Changelog**: a link to `CHANGELOG.md`.
7. **License**.

### Changelog

- Use the [Keep a Changelog](https://keepachangelog.com/) format, newest release first.
- Keep pending changes under `## [Unreleased]`.
- Each release gets a `## X.Y.Z` section, matching its tag `vX.Y.Z`.
- Section headings: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Entries can be written by hand or generated from commits and release notes. The `gith` tool from [@tertium/gith](https://www.npmjs.com/package/@tertium/gith) generates them and adds each version as its own commit, `docs(changelog): <version>`.

### Versions and releases

- Use Semantic Versioning. Pre-releases such as `-rc.1` are not marked as the latest version.
- A release bumps the version in the manifest, creates the `vX.Y.Z` tag on `main`, and pushes both.
- Patches are small commits on `main`.
- Each tag has a GitHub Release. Its body is the matching changelog section.
- What is attached to the Release depends on the project type (see Desktop app and Browser extension). A web app is deployed, not released as files.

#### npm scripts

Projects with a `package.json` expose the same commands:

```json
{
  "scripts": {
    "changelog": "npx @tertium/gith changelog",
    "release:patch": "npx @tertium/gith release --patch",
    "release:minor": "npx @tertium/gith release --minor",
    "release:major": "npx @tertium/gith release --major"
  }
}
```

### Screenshots and social preview

- **Screenshots**: `docs/screenshots/NN-short-name.png`, numbered in display order, at most 1280 pixels wide.
- **Social preview** (the image GitHub shows for the repository): 1280 by 640 pixels, set in the repository settings on GitHub, not stored in the repository. Web apps also need a share image in the site itself (see Web app).

### Project attributes

`project.yml` at the repository root is the project's manifest. It holds every fact about the project that GitHub, the ecosystem's own manifest and the store listings do not already hold, in one file. See `project--example.yml` for every field, with placeholder values. For one platform, see `project--example--<platform>.yml` (android, ios, web, windows, macos, linux, chromium, firefox, vscode, telegram). A desktop app built for several systems from one code base is `project--example--crossplatform.yml`. A command-line tool is `project--example--cli.yml`.

Facts that the ecosystem's manifest already holds are not repeated in `project.yml`. These are `version` and `license` in `package.json` (or `manifest.json` for extensions), `repository` in `package.json`, and `engines` in `package.json`. Tools read them from there, and the two files must agree. The repository itself provides `CHANGELOG.md` and `SECURITY.md`.

Tools read the file with a YAML parser. `scripts/manifest/manifest.ts` checks the file against this section and writes the store text per language in the Fastlane layout (`bun scripts/manifest/manifest.ts project.yml <out-dir>`). It lists every problem and exits with an error when a required field is missing, a text is too long, or a compliance answer is missing. With `--check-files`, it also checks that the icon, share image, screenshots and feature graphic exist and have the right size. The iOS `settings.json` gets its defaults: `sku` is the identifier, and `copyright` is the owner and the current year. A repository without `project.yml` is missing attributes and gets a `convention-todo` issue (see Missing attributes).

Required means required for every project unless the type notes below say otherwise.

#### Identity

| Field | Required | Meaning |
| --- | --- | --- |
| `type` | yes | What the project is. One of: `cli`, `library`, `web-app`, `mobile-app`, `desktop-app`, `browser-extension`, `firefox-extension`, `vscode-extension`, `npm-package`, `telegram-sticker-pack`, `cookbook`, `guide`, `style-guide`, `conventions`, `icon-set`, `css-library`, `code-generator`, `agreement`. |
| `identifier` | yes, unless every installed platform sets its own | Reverse-DNS name, for example `com.tertium.pumpkintimer`. It is the default for every platform. A platform may override it with `platforms.<id>.identifier`. Use a domain the team owns. Fix it before the first store upload: Android and iOS identifiers cannot change after that. |
| `display_name` | yes | Map of language to the name people see. It is the store title and the README title. |
| `short_name` | no | One short word for tight spaces. For a CLI, the command name. |
| `summary` | yes | Map of language to one sentence, up to 120 characters. The default language is the GitHub description. It is the Android short description. |
| `description` | for stores | Map of language to the long text. It is the store description. |
| `keywords` | no | Search keywords, lowercase. |
| `categories` | no | Store and catalogue categories, lowercase, for example `entertainment`, `developer-tools`. |
| `status` | no | `alpha`, `beta`, `stable`, `maintenance` or `archived`. |
| `language` | no | Set only when GitHub's detected language is wrong, for example `Markdown` for documentation repositories. |

Text fields are language maps: one key per language, the same keys as `languages`. A project with one language still writes it as a map, for example `display_name: { en: Pumpkin Timer }`.

#### Languages

| Field | Required | Meaning |
| --- | --- | --- |
| `languages` | yes, when the project has a user interface or product documentation | BCP 47 tags of every language the project is written in, for example `en`, `pt-BR`. |
| `default_language` | yes, when `languages` is set | Used when a reader's language is not in the list. |
| `rtl_languages` | no | The subset of `languages` written right to left. |
| `code_languages` | no | Programming languages the project is written in, for example `TypeScript`. These are not spoken languages. |

#### Links

| Field | Required | Meaning |
| --- | --- | --- |
| `url` | web apps with a site | Public home page. Absolute `https` URL. Omit when there is none. |
| `documentation` | no | Documentation URL. |
| `support` | no | Where people ask for help: issue tracker, forum or contact page. |
| `funding` | no | Donation or sponsorship URL. |
| `privacy_policy` | yes, when `data_collected` is not `none`, and for Android and iOS | Absolute URL. |
| `terms_of_service` | no | Absolute URL. |

Prefer a URL over an email address in the repository.

#### People

| Field | Required | Meaning |
| --- | --- | --- |
| `team` | yes | List of people who work on the project. Each person has `name`, `roles` and optional `github` (GitHub login), `url` and `languages`. |
| `team[].roles` | yes | One or more of: `owner`, `maintainer`, `developer`, `designer`, `translator`, `reviewer`, `contributor`. A person may hold several roles. |
| `team[].languages` | for translators | The languages the person translates into, as BCP 47 tags from `languages`. |

- The `owner` is the person `author` in `package.json` names.
- Do not put email addresses in `team`. Use `github` or `url` as the contact.
- Names in examples are placeholders. Real people replace them.

#### Technology

| Field | Required | Meaning |
| --- | --- | --- |
| `runtime` | no | Runtime versions the project needs, for example `node >=24`, `bun`. Matches `engines` in `package.json`. |
| `frameworks` | no | Frameworks the project is built with, by name, for example `Angular`, `React`, `SolidJS`. |

#### Media

| Field | Required | Meaning |
| --- | --- | --- |
| `icon` | yes | Path to the square icon, at least 512 by 512 pixels. 1024 by 1024 when iOS is a platform. |
| `social_card` | web apps | Path to the share image, 1200 by 630 pixels. Served as `/social-card.png` (see Web app). |
| `screenshots` | no | Paths to screenshots in display order, from `docs/screenshots/`. |
| `video` | no | URL of a demonstration video. |

#### Distribution

| Field | Required | Meaning |
| --- | --- | --- |
| `distribution` | no | Where the project is published: `github-releases`, `npm`, `web`, `chrome-web-store`, `firefox-addons`, `microsoft-store`, `mac-app-store`, `app-store`, `google-play`, `flathub`. |
| `environments` | no | Deployment environments, for example `dev` and `prod`. Never host names. |

#### Privacy and content

| Field | Required | Meaning |
| --- | --- | --- |
| `data_collected` | yes, for stores | `none`, or the categories of data the project collects or transmits, for example `account`, `usage`, `location`. |
| `age_rating` | no | `everyone`, `teen` or `mature`. |
| `accessibility` | no | The standard the project tests against, for example `WCAG 2.2 AA`. Only when tested. |

#### Platforms

`platforms` is a map. Each key is a platform, and every platform uses the same keys, so a generator reads any platform the same way and writes the native file for it.

| Key | Required | Meaning |
| --- | --- | --- |
| `min_version` | yes for `android` and `ios`; optional otherwise | Lowest version the platform runs on. Android uses the API level as an integer, iOS uses the OS version as a string. The generator writes it as `minSdkVersion` (Android) or `MinimumOSVersion` (iOS). |
| `identifier` | no | Overrides the top-level `identifier` for this platform. Use it when a platform needs its own ID, for example iOS bundle IDs that differ from Android, or Windows package names. Android and iOS use it as the application ID and bundle ID, and iOS uses it as the default SKU. Chromium and Firefox extension IDs come from the store, so their identifier is not checked. |
| `permissions` | no | List of `name` and `reason`. On Android, `name` is the permission. On iOS, `name` is the `Info.plist` usage-description key. Each reason is shown to users. |
| `screenshots` | yes for stores | Map of device class to a list of paths in `docs/screenshots/`. Device classes are listed under each platform. |
| `distribution` | no | Stores for this platform, for example `google-play`, `app-store`. |
| `settings` | no | Anything that only one platform has. Each platform's section lists its keys. |

A platform with no settings is written as `web:` with nothing after it.

#### Android

Used by `mobile-app` projects that ship to Google Play.

| Field | Required | Meaning |
| --- | --- | --- |
| `platforms.android.min_version` | yes | Lowest API level the app runs on, as an integer, for example `26`. |
| `platforms.android.permissions` | no | See Platforms. |
| `platforms.android.screenshots` | yes | `phone` (at least two images), and optionally `tablet_7` and `tablet_10`. |
| `platforms.android.settings.version_code` | no | Integer that increases with every upload. When missing, the build's version code is used. |
| `platforms.android.settings.target_version` | no | API level the app is built for. When missing, the newest level the store accepts is used. |
| `platforms.android.settings.category` | no | Google Play category, for example `TOOLS`. |
| `platforms.android.settings.feature_graphic` | no | Path to the 1024 by 500 pixel feature graphic, in `assets/store/android/`. |

#### iOS

Used by `mobile-app` projects that ship to the App Store.

| Field | Required | Meaning |
| --- | --- | --- |
| `platforms.ios.min_version` | yes | Lowest iOS version the app runs on, as a string, for example `"16.0"`. |
| `platforms.ios.permissions` | when the app asks for a permission | Each `name` is an `Info.plist` usage-description key, for example `NSCameraUsageDescription`. |
| `platforms.ios.screenshots` | yes | Device classes `iphone_6_9` and `ipad_13`, each with paths. |
| `platforms.ios.settings.sku` | no | Identifier for App Store Connect. When missing, the top-level `identifier` is used. |
| `platforms.ios.settings.primary_category` | yes | App Store category, for example `Utilities`. |
| `platforms.ios.settings.secondary_category` | no | Second App Store category. |
| `platforms.ios.settings.copyright` | no | Copyright line. When missing, the owner's name and the current year are used. |

The app icon for iOS is 1024 by 1024 pixels, in `assets/logo/` or `assets/icons/`.

#### Store listing

Store text is taken from the app fields. A store entry is written only when a store needs different text. Store overrides go under `store`, one entry per field, each with a language map.

| Store text | Taken from | Android file | iOS file | Limit (characters) |
| --- | --- | --- | --- | --- |
| `title` | `display_name` | `title.txt` | `name.txt` | 30 (Play title not confirmed) |
| `short_description` | `summary` | `short_description.txt` | not used | 80 |
| `description` | `description` | `full_description.txt` | `description.txt` | 4000 |
| `subtitle` | `store.subtitle` only | not used | `subtitle.txt` | 30 |
| `keywords` | `store.keywords` only | not used | `keywords.txt` | 100 (bytes or characters not confirmed) |
| `promotional_text` | `store.promotional_text` only | not used | `promotional_text.txt` | 170 |
| `release_notes` | `store.release_notes` only | `release_notes.txt` | `release_notes.txt` | 500 on Android, 4000 on iOS (not confirmed) |

```yaml
display_name:
  en: Pumpkin Timer
  fr: Minuteur Citrouille
store:
  subtitle:
    en: Halloween countdown timer
```

- Every language in `languages` needs a `display_name`, a `summary`, and a `description` for every mobile platform.
- A store override naming a language that is not in `languages` is an error.
- Confirmed against the stores' own pages: Google Play short description 80 and full description 4000; App Store name 30, subtitle 30, description 4000 and promotional text 170.
- Not confirmed: the Google Play title (30 in third-party guides, 50 in one), the release-notes limits, and the iOS keywords limit (100, given as bytes in one source and characters in another). Confirm these in the consoles before a submission.
- The script writes these files into `metadata/<platform>/<language>/`, and `settings.json` for each platform with its defaults applied.

#### Compliance

Answers that the store forms ask for, so they are filled in from this file and kept in one place. The checker requires `pricing` and `content_rating` for every mobile app, `target_audience` and `data_safety` for Android, and `export_compliance.uses_encryption` for iOS.

| Field | Required | Meaning |
| --- | --- | --- |
| `compliance.pricing` | yes | `free` or `paid`. |
| `compliance.export_compliance.uses_encryption` | yes, for iOS | `true` or `false`. |
| `compliance.content_rating` | yes | Answers to the content questionnaire. Each key is a question, each value is the answer. |
| `compliance.target_audience` | yes, for Google Play | Audiences the app is made for, for example `all ages`. |
| `compliance.data_safety` | yes, for Google Play | `collects`, `shares` and `deletion_request_url`, as the Play data-safety form asks. |
| `privacy_policy` (top level) | yes, for Android and iOS | Absolute URL of the privacy policy. |

#### Type notes

- **`web-app`**: requires `url`, `languages`, `default_language`, `social_card`, `platforms: web`.
- **`mobile-app`**: requires `identifier`, `platforms` (`android`, `ios`, or both), `display_name`, `summary`, `description`, `privacy_policy`, and `compliance`. Each platform in `platforms` has its `min_version`.
- **`desktop-app`**: requires `platforms` and `icon`. Platform builds are attached to the Release (see Desktop app).
- **`browser-extension`** and **`firefox-extension`**: require `platforms` (`chromium` or `firefox`) and a store in `distribution`. The `manifest.json` holds the version, name and icons.
- **Doc projects** (`guide`, `cookbook`, `style-guide`, `conventions`, `agreement`): require `languages`, `default_language`, `audience`, `entry_point` (inside `content/`, which must exist) and `platforms` (usually `web`).

#### What reads the manifest

| Consumer | Reads |
| --- | --- |
| Web app manifest (`manifest.webmanifest`) | `display_name`, `short_name`, `summary`, `languages`, `icon` |
| Page metadata and JSON-LD | `display_name`, `summary`, `url`, `languages`, `default_language`, `social_card`, `license` from `package.json` |
| Language switcher | `languages`, `default_language`, `rtl_languages` |
| Tertium site | `display_name`, `summary`, `type`, `frameworks`, `code_languages`, `categories` |
| Store metadata (`metadata/`, written by `scripts/manifest`) | `display_name`, `summary`, `description`, `store`, `languages`, `platforms`, `privacy_policy` |
| Store listings | `display_name`, `summary`, `categories`, `privacy_policy`, `data_collected`, `age_rating`, `screenshots` |

### Repository metadata

- **Description**: one sentence, up to 120 characters.
- **Topics**: used for discovery on GitHub. The project type belongs in `project.yml`, not in topics.
- **Website**: the homepage URL, when the project has one.
- **Language**: GitHub detects it. A documentation repository that contains code samples marks them in `.gitattributes`, for example `*.php linguist-documentation`.

### Missing attributes

A project that lacks a required file or attribute gets a GitHub issue labelled `convention-todo`, titled with the missing item, for example `Add LICENSE file`. Close the issue when the item is added.

### Names

Every project has three names:

| Name | Form | Example | Used for |
| --- | --- | --- | --- |
| Repository name | Lowercase, hyphenated | `portal-commander-file-manager-community` | GitHub URL, folder name, release tags |
| Display name | Proper name, with capitals and spaces | `Portal Commander` | README title, documentation |
| Short name | One word, lowercase, optional | `hlpr` | Command names, mentions in text |

- The display name is the first heading of `README.md`. A scoped npm package keeps its scope, for example `@tertium/hlpr`.
- A CLI tool's short name is also its command name.
- Do not use a short name that is already another project's command or package.

### Licence

- Open-source projects use the MIT licence unless there is a reason for another. The `LICENSE` file is required.
- A project with its own terms (for example, personal-use only) names those terms in `LICENSE`.
- Creative assets such as sticker packs can use CC BY 4.0, with attribution in the README.

### Example: Tertium site

The Tertium site lists and links projects from their repositories. It reads these fields:

| Site field | Source |
| --- | --- |
| Display name | First heading of `README.md` |
| Description | GitHub description |
| Repository name | GitHub repository name (URLs, folders) |
| Type | `type` in `project.yml` |
| Language and frameworks | `language` (or GitHub's language), `frameworks` in `project.yml` |
| Icon | Language icon, or the Markdown icon for `documentation` topics; sticker packs use their first sticker |
| Version and date | Latest `vX.Y.Z` tag and its commit date |
| Downloads | GitHub Releases |
| Changelog | `CHANGELOG.md` |

---

## Doc project

For `guide`, `cookbook`, `style-guide`, `conventions` and `agreement`. The Markdown files are the product.

- `content/` holds the documentation that the project delivers, organised by topic. Its Markdown files are written for readers.
- A doc project with no product documentation beyond its README has no `content/` folder.
- Links inside `content/` are relative to the file that contains them.
- `language` is `Markdown` in `project.yml` when GitHub detects another language.
- Do not add `src/` or `dist/` unless the project ships a generated artifact. A doc project has no release artifacts.

#### Doc fields

| Field | Required | Meaning |
| --- | --- | --- |
| `audience` | yes | Who the document is for, as a list of short labels, for example `parents`, `developers`, `translators`. |
| `entry_point` | yes | Path to the first page a reader opens, inside `content/`, for example `content/README.md`. The file must exist. |
| `formats` | no | Formats the document is delivered in: `markdown`, `html`, `pdf`. |

The checker also requires a `content/` folder next to `project.yml`.

---

## Browser extension

For `browser-extension` (Chromium) and `firefox-extension`. Applies to the extension itself. Store listing rules change, so check them before each submission.

- The manifest is `manifest.json` at the root. Its `name`, `version` and `icons` must match the repository's version and icons.
- Icons: `assets/icons/` holds the 16, 48 and 128 pixel PNG icons that the manifest references.
- Store listing images go in `assets/store/<browser>/`, for example `assets/store/chrome/` or `assets/store/firefox/`.
- The packaged extension (`.zip` for Chromium, `.xpi` for Firefox) is built into `dist/` and attached to the GitHub Release.
- Permissions in `manifest.json` are kept to the minimum the extension needs. The README names each permission and its reason.

---

## Web app

For `web-app`. **This section is specific to web projects.** A desktop app does not have `public/`, a web manifest, a sitemap or a share image. The Desktop app section does not apply to web apps.

### public/

`public/` holds files that are served exactly as they are, from the site root. A file at `public/robots.txt` is served at `/robots.txt`. Build tools copy it into the output unchanged.

Typical contents:

| File | Served at | Purpose |
| --- | --- | --- |
| `favicon.ico` | `/favicon.ico` | Real icon file. Browsers request this path by default. |
| `favicon.svg` | `/favicon.svg` | Scalable icon for modern browsers. |
| `apple-touch-icon.png` | `/icons/apple-touch-icon.png` | 180 by 180 pixels, for iOS home screens. |
| `icons/icon-192.png`, `icons/icon-512.png` | `/icons/...` | Icons referenced by the manifest. |
| `manifest.webmanifest` | `/manifest.webmanifest` | Web app manifest: name, colours, `display`, and icons. |
| `robots.txt` | `/robots.txt` | Crawl rules and the sitemap location. |
| `social-card.png` | `/social-card.png` | Share image, 1200 by 630 pixels. |

Rules:

- A missing file must return a real 404 status. It must not return the app shell with status 200, because crawlers then index every unknown URL.
- `robots.txt` and the sitemap are either static files in `public/` or generated routes. Their URLs are absolute `https` URLs (see Absolute URLs).
- Icons and the manifest are linked from `<head>`: `<link rel="icon">`, `<link rel="apple-touch-icon">` and `<link rel="manifest">`.
- `manifest.webmanifest` names the app, sets `display` to `standalone`, and sets `theme_color` and `background_color`. Its icons are the 192 and 512 pixel PNGs above.

### robots.txt

- `User-agent: *`, `Allow: /` for a public site.
- A `Sitemap:` line pointing to the sitemap, with the same absolute `https` origin as the pages.
- Pages that are not for search (for example, personal content) are marked `noindex` in the page itself. `robots.txt` does not hide them, because a blocked page cannot be seen to carry `noindex`.

### Absolute URLs

- Canonical, `og:url`, `og:image` and `twitter:image` must be absolute `https://<host>/...` URLs.
- Behind a reverse proxy the app sees plain `http`. Build the origin from the `X-Forwarded-Proto` header that the proxy sends, and use the request's own protocol only for local development.

### Sitemap and languages

- A multilingual site lists every language URL in `/sitemap.xml`. Each entry carries `xhtml:link` alternates for all languages, plus `x-default`.
- Each page sets `<html lang>` to its language and has `hreflang` alternates and `x-default`.
- `og:locale` is set for the page, with `og:locale:alternate` for the others.
- Pages with personal content (for example, a card sent to someone) are `noindex,follow` and send `Referrer-Policy: no-referrer`.

### Previews

- `og:title`, `og:description`, `og:image` and `og:image:alt` are translated for each language. Use `twitter:card` set to `summary_large_image`.
- Check the live page with the Facebook Sharing Debugger and Telegram's preview before calling it done.

### Structured data

- A JSON-LD block (`WebApplication`) with `inLanguage` on each language page.

---

## Mobile app

For `mobile-app`: Android and iOS apps that ship through the stores. **This section is specific to mobile apps.** A web app follows the Web app section, and a desktop app follows the Desktop app section.

- `identifier` is the reverse-DNS name of the app. It is the Android application ID and the iOS bundle ID, so it never changes after the first upload.
- The store text, screenshot paths and compliance answers are in `project.yml`, under `store`, `platforms.android`, `platforms.ios` and `compliance` (see Project attributes). Do not type them into the store forms by hand.
- Store builds (`.aab` for Google Play, `.ipa` for the App Store) are uploaded to the stores. They are not attached to the GitHub Release unless the project also publishes them directly.
- Store images follow the Assets rules. Listing images go in `assets/store/android/` and `assets/store/ios/`.

## Desktop app

For `desktop-app`. Applies to native apps packaged per platform. Web apps do not follow this section.

- Platform builds are generated into `dist/` (`.exe`, `.msi`, `.dmg`, `.AppImage`, and so on). They are attached to the GitHub Release.
- Store listing images go in `assets/store/<platform>/`, for example `assets/store/windows/`, `assets/store/macos/`, `assets/store/android/`.
- The app icon is in `assets/icons/`, in the sizes each platform requires.

### Publishing assets

Projects published to a store also need the store's assets. Check the store's current rules before submitting. The values below were checked when this guide was written.

| Store | Asset | Requirement | Status |
| --- | --- | --- | --- |
| Microsoft Store (Windows) | Store logo | Listed as required in the submission FAQ and as optional on the listing page. Confirm in Partner Center. | Conflicting sources |
| Microsoft Store (Windows) | Screenshots | PNG up to 50 MB, desktop at 1366 x 768 or larger. | Verified; counts conflict |
| Microsoft Store (Windows) | Privacy policy URL | Required when the app collects or transmits personal information. | Verified |
| Mac App Store (macOS) | App icon | 1024 x 1024 pixels. | Confirm in App Store Connect |
| Mac App Store (macOS) | Screenshots | Not confirmed. | To verify |
| Google Play (Android) | App icon | 512 x 512, 32-bit PNG with alpha, up to 1024 KB. | Verified by secondary sources |
| Google Play (Android) | Feature graphic | 1024 x 500, JPEG or 24-bit PNG without alpha. | Verified |
| Google Play (Android) | Screenshots | JPEG or 24-bit PNG without alpha, 320 to 3840 px, longest side at most twice the shortest. At least 2 required. | Partly verified |

---

## Changes to this guide

Changes are listed in [CHANGELOG.md](CHANGELOG.md).

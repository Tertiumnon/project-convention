# Project Structure Convention

How to lay out a software project and its GitHub repository, so that every project looks the same to the people who read it and to the tools that build, release and list it.

The guide builds on [Standard Readme](https://github.com/RichardLitt/standard-readme) for the README, [Keep a Changelog](https://keepachangelog.com/) for the changelog, [Semantic Versioning](https://semver.org/) for versions.

The guide has one **Common** section, which applies to every project, and one section per project type. Find your project type in `project.yml` (see Project attributes) and read the Common section plus that type's section:

- [Doc project](#doc-project): `guide`, `cookbook`, `style-guide`, `conventions`, `agreement`
- [Browser extension](#browser-extension): `browser-extension`, `firefox-extension`
- [Web app](#web-app): `web-app`
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

`project.yml` at the repository root holds attributes that GitHub does not provide:

```yaml
type: web-app
frameworks:
  - SolidJS
```

| Field | Required | Meaning |
| --- | --- | --- |
| `type` | yes | What the project is. One of: `cli`, `library`, `web-app`, `desktop-app`, `browser-extension`, `firefox-extension`, `vscode-extension`, `npm-package`, `telegram-sticker-pack`, `cookbook`, `guide`, `style-guide`, `conventions`, `icon-set`, `css-library`, `code-generator`, `agreement`. |
| `language` | no | Set only when GitHub's detected language is wrong, for example `Markdown` for documentation repositories. |
| `frameworks` | no | Frameworks the project is built with, by name, for example `Angular`, `React`, `SolidJS`. |

- Tools read the file with a YAML parser.
- A repository without `project.yml` is missing an attribute and gets a `convention-todo` issue (see Missing attributes).

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

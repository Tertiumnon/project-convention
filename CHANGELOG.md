## [Unreleased]

### Added

- Sections per project type: Doc project, Browser extension, Web app, Desktop app. The Common section applies to all.
- Web app: `public/` folder, its usual files (favicons, icons, `manifest.webmanifest`, `robots.txt`, share image), and the rule that missing files return a real 404.
- Web app: `robots.txt` rules, absolute `https` URLs behind a proxy, sitemap alternates, per-language previews and JSON-LD.
- Browser extension: `manifest.json` and icon rules.
- `project.yml` as the full project manifest: identity, languages, links, people, platforms, media, distribution, privacy. `project--example.yml` shows a complete web app.
- Mobile app: `mobile-app` type, `identifier`, Android and iOS blocks, store text per language, and compliance answers. `project--example.yml` lists every field, and `project--example--<platform>.yml` gives one example per platform, and `project--example--crossplatform.yml` covers a desktop app built for Windows, macOS and Linux together, and `project--example--cli.yml` covers a command-line tool.
- Universal platform keys: every platform uses `min_version`, `identifier`, `permissions`, `screenshots`, `distribution` and `settings`. `min_sdk` and `min_os` are now `min_version`. iOS usage descriptions are `permissions`.
- Optional fields: `version_code`, `target_version`, iOS `sku` and `copyright` can be left out. The spec gives their defaults. The checker does not fill them in yet.
- `platforms` is a map. Each platform holds its own settings (`platforms.android`, `platforms.ios`) instead of separate `android` and `ios` blocks.
- Doc projects: `audience`, `entry_point` and `formats` fields, a `content/` check and `project--example--guide.yml`.
- Checker: compliance requirements for mobile apps, iOS settings defaults (`sku`, `copyright`) written to `settings.json`, and `--check-files` for image existence and size.
- Store limits: the confirmed and unconfirmed values are listed in the README.
- Flat manifest: fields sit at the top level, with no `app:` parent. Text fields (`display_name`, `summary`, `description`) are language maps.
- Store text comes from the app fields. `store:` holds only overrides, such as iOS `subtitle`, `keywords` and `promotional_text`.
- Store text is keyed by field, then language (`store.description.fr`), so each text is written once.
- `scripts/manifest/manifest.ts`: checks `project.yml` against the convention and writes store text in the Fastlane layout.
- `team` in `project.yml`: people with roles (`owner`, `maintainer`, `developer`, `designer`, `translator`, `reviewer`, `contributor`) and the languages translators work on. Replaces `author` and `maintainers`.

### Changed

- Store listing rules moved from Common to the Desktop app section.
- `content/` is listed for doc projects only.

## 1.2.0

### Added

- `content/` for documentation as the product, separate from `docs/`.
- `data/` for structured data the project reads or writes.
- Documentation section: `docs/` is for notes about the project, and agents may use it.

### Changed

- `docs/` no longer holds product documentation.

## 1.1.1

### Removed

- `.github/` folder from the standard: it is specific to GitHub, so it is not a universal rule.

## 1.1.0

### Added

- Source and build output rules: `src/`, one of `build/` or `dist/`, both git-ignored.
- Assets rules: `assets/` for static binary files, with subfolders by kind (logo, icons, images, fonts, store, stickers).
- Root rule covers community health files and the tool configuration a project requires.

### Changed

- Logo path is `assets/logo/logo.svg` or `.png`, replacing `assets/logo.*`.
- Sticker images move to `assets/stickers/`, replacing `stickers/`.

## 1.0.0

### Added

- Project structure guide: root files, folders, README, changelog, releases, logo and screenshots.
- Project attributes in `project.yml`: type, language override and frameworks.
- Repository metadata, publishing assets per store, missing attributes, names and licence rules.

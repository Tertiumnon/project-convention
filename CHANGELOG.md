## [Unreleased]

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

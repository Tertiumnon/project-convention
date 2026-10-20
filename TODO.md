# To do

Open work on the project manifest (`project.yml`), its checker and its generators. Done items are in CHANGELOG.md.

## Decisions needed

- [ ] **Identifier domain.** The examples use `com.tertium.hallowentine`. Flathub needs a domain the project controls. Choose between `io.github.tertiumnon.halloweentine` (GitHub, no domain needed) and a domain Tertium owns, such as `dev.tiii.hallowentine`. Fix it before the first store upload, because Android and iOS identifiers cannot change afterwards.
- [ ] **Publisher identity.** Decide which Microsoft publisher subject (`CN=...`) and which Apple team and Google Play developer account the projects use. Keep account IDs and emails out of the repo, in SSM.

## Verify against the native documentation

- [ ] **Store categories.** Google Play's category list and Apple's `LSApplicationCategoryType` values for `utilities` and `social-networking` were not confirmed. Check them in the Play Console and App Store Connect, then update the category table.
- [ ] **Mapping table.** Only the MSIX version and publisher rules and the AppStream domain rule are confirmed. Check every other cell of the Mapping table in the README against the native docs.
- [ ] **Store text limits.** Confirm the Google Play title limit (30 or 50), the release-notes limits, and whether the iOS keywords limit counts bytes or characters.
- [ ] **Content ratings and privacy.** Map `content_rating` to the App Store age-rating questions, the Play content-rating questionnaire, and the OARS ratings used by Linux stores. Map `data_collected` to the App Store privacy labels and the Play data-safety form.
- [ ] **Icon sizes.** Confirm the sizes each platform needs: Android launcher and adaptive icons, iOS asset catalogue, Chromium 16/48/128, Windows tiles, and AppStream 64/128.

## Generators

- [ ] **Android.** `AndroidManifest.xml` (application ID, SDK levels, permissions, deep links), adaptive icons, and `strings.xml` for each language from `display_name`.
- [ ] **iOS.** `Info.plist` (bundle ID, `MinimumOSVersion`, usage descriptions, `LSApplicationCategoryType`, `ITSAppUsesNonExemptEncryption`, `CFBundleLocalizations`), and the app icon set.
- [ ] **macOS.** `Info.plist` and entitlements (App Store sandbox), plus `NSHumanReadableCopyright` from `copyright`.
- [ ] **Windows.** `AppxManifest.xml` (identity, publisher, four-part version, capabilities from `permissions`, visual elements from the theme colours).
- [ ] **Linux.** AppStream metainfo (`id`, `name`, `summary`, `description`, `releases`, `launchable`, `content_rating`) and a Flatpak manifest (`runtime` from `platforms.linux.settings.runtime`).
- [ ] **Icons.** One generator for all icon sizes, from the SVG or 1024 PNG source in `icon`.
- [ ] **Tests.** Each generator needs a test that checks its output against a fixture, and the example files need a test in CI.

## Checker

- [ ] **Compliance.** Check the Apple and Google compliance answers against the list above once it is mapped.
- [ ] **Files.** `--check-files` covers the icon, share image, screenshots and feature graphic. Add checks for the store screenshot sizes.
- [ ] **Defaults.** Apply the defaults from the spec in the generators, not only in `settings.json`: `version_code` from the build, and `target_version` from the store's current requirement.

## Project repos

- [ ] **Hallowentine.** Decide the identifier first, then update `project.yml` with the chosen value and the store text.
- [ ] **Hallowentine.** Add `project.yml` to the repo, using the flat layout.
- [ ] **Hallowentine.** The hotfix `hotfix/1.0.2` is open. Finish or drop it when approved. Deploy to prod only with approval.

## Repo maintenance

- [ ] **Merge.** `project-types` is not merged into `main`. Review and merge when the decisions above are made.
- [ ] **Convention changelog.** Keep `Unreleased` up to date for every spec change.

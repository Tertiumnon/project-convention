import { afterEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { checkProject } from './project.check'

const validManifest = `type: conventions
slug: project-convention
display_name:
  en: Project Structure Convention
summary:
  en: Standard layout for projects.
languages:
  - en
default_language: en
audience:
  - developers
entry_point: README.md
icon: assets/logo/logo.svg
team:
  - name: John Doe
    roles:
      - owner
listed_on:
  - https://johndoe.example
`

const dirs: string[] = []

const createProject = (manifest: string, files = ['README.md', 'LICENSE', 'CHANGELOG.md', '.gitignore', 'assets/logo/logo.svg']): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hlpr-project-check-'))
  dirs.push(dir)
  fs.writeFileSync(path.join(dir, 'project.yml'), manifest)
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.writeFileSync(path.join(dir, file), '')
  }
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('project check', () => {
  test('a complete doc project has no problems', () => {
    expect(checkProject(createProject(validManifest))).toEqual([])
  })

  test('reports unknown fields, a bad slug and a non-https catalogue', () => {
    const manifest = validManifest
      .replace('slug: project-convention', 'slug: Project_Convention\npublish_on: []')
      .replace('https://johndoe.example', 'http://johndoe.example')
    expect(checkProject(createProject(manifest))).toEqual([
      'Unknown field publish_on - remove it or add it to the convention',
      'slug Project_Convention must be lowercase and hyphenated, for example pumpkin-timer',
      'http://johndoe.example must be an absolute https URL',
    ])
  })

  test('reports missing required fields, files and logo', () => {
    expect(checkProject(createProject('type: cli\n', []))).toEqual([
      'Missing slug', 'Missing display_name', 'Missing summary', 'Missing team', 'Missing icon',
      'Missing file README.md', 'Missing file LICENSE', 'Missing file CHANGELOG.md', 'Missing file .gitignore',
      'Missing file docs/INSTALL.md', 'Missing file docs/USAGE.md', 'Missing file docs/DEVELOPMENT.md', 'Missing file docs/PUBLISH.md',
      'Missing file assets/logo/logo.svg or assets/logo/logo.png',
    ])
  })

  test('text fields must use the same languages as languages', () => {
    const manifest = validManifest.replace('languages:\n  - en', 'languages:\n  - en\n  - fr').replace('summary:\n  en: Standard layout for projects.', 'summary: Standard layout.')
    expect(checkProject(createProject(manifest))).toEqual([
      'display_name must be a language map with keys en, fr, not en',
      'summary must be a language map with keys en, fr, not plain text',
    ])
  })

  test('reports a team without an owner and unknown roles', () => {
    const manifest = validManifest.replace('- owner', '- boss')
    expect(checkProject(createProject(manifest))).toEqual([
      'team[0] role boss is not one of: owner, maintainer, developer, designer, translator, reviewer, contributor',
      'team needs a person with the owner role',
    ])
  })

  test('stores belong under platforms and Firefox needs an email-like ID', () => {
    const manifest = `${validManifest}identifier: com.johndoe.timer\ndistribution:\n  - google-play\nplatforms:\n  firefox:\n    distribution:\n      - npm\n  android:\n`
    expect(checkProject(createProject(manifest))).toEqual([
      'platforms.firefox.distribution: npm is not a store - use one of: google-play, app-store, chrome-web-store, firefox-addons, microsoft-store, mac-app-store, flathub',
      'Firefox ID com.johndoe.timer must be a GUID or email-like, for example pumpkin-timer@johndoe.example - set platforms.firefox.identifier',
      'Missing platforms.android.min_version',
      'distribution: google-play is not one of github-releases, npm, web - stores go in platforms.<id>.distribution',
    ])
  })

  test('installed platforms need an identifier', () => {
    const manifest = `${validManifest}platforms:\n  windows:\n  firefox:\n    identifier: timer@johndoe.example\n`
    expect(checkProject(createProject(manifest))).toEqual(['Missing identifier for platform windows - set identifier or platforms.windows.identifier'])
  })

  test('fails fast without project.yml', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hlpr-project-check-'))
    dirs.push(dir)
    expect(() => checkProject(dir)).toThrow('add project.yml at the project root')
  })
})

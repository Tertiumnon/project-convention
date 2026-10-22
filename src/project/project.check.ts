import fs from 'node:fs'
import path from 'node:path'
import {
  baseFields, channels, commonFiles, docsFiles, fields, firefoxIdPattern, installedPlatforms, logoFiles, noDocsTypes,
  platformIds, projectTypes, roles, screenshotTypes, slugPattern, stores, textFields, typeFields,
} from './project.constants'

type Manifest = Record<string, unknown>

const isObject = (value: unknown): value is Manifest => typeof value === 'object' && value !== null && !Array.isArray(value)

const list = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : []

const has = (manifest: Manifest, keyPath: string): boolean => {
  let value: unknown = manifest
  for (const key of keyPath.split('.')) {
    if (!isObject(value) || !(key in value)) return false
    value = value[key]
  }
  return true
}

const readManifestText = (dir: string): string => {
  const file = path.join(dir, 'project.yml')
  if (!fs.existsSync(file)) throw new Error(`Missing ${file} - add project.yml at the project root`)
  return fs.readFileSync(file, 'utf8')
}

const parseManifest = (text: string): Manifest => {
  const manifest: unknown = Bun.YAML.parse(text)
  if (!isObject(manifest)) throw new Error('project.yml must be a YAML mapping of fields')
  return manifest
}

// The YAML parser keeps the last of two equal keys without a warning, so repeats are found in the text.
const checkDuplicates = (text: string): string[] => {
  const keys = [...text.matchAll(/^([A-Za-z_][\w-]*):/gm)].map(match => match[1])
  return [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))].map(key => `Duplicate field ${key} - keep one`)
}

const checkFields = (manifest: Manifest): string[] => {
  const type = String(manifest.type)
  const required = [...baseFields, ...(typeFields[type] ?? [])]
  const urls = [...(manifest.url === undefined ? [] : [String(manifest.url)]), ...list(manifest.listed_on)]
  return [
    ...Object.keys(manifest).filter(key => !fields.includes(key)).map(key => `Unknown field ${key} - remove it or add it to the convention`),
    ...required.filter(key => !has(manifest, key)).map(key => `Missing ${key}`),
    ...(has(manifest, 'type') && !projectTypes.includes(type) ? [`type ${type} is not one of: ${projectTypes.join(', ')}`] : []),
    ...(has(manifest, 'slug') && !slugPattern.test(String(manifest.slug)) ? [`slug ${manifest.slug} must be lowercase and hyphenated, for example pumpkin-timer`] : []),
    ...urls.filter(url => !url.startsWith('https://')).map(url => `${url} must be an absolute https URL`),
  ]
}

const checkLanguages = (manifest: Manifest): string[] => {
  if (!has(manifest, 'languages')) return []
  const languages = list(manifest.languages)
  const expected = [...languages].sort().join(', ')
  const problems = languages.includes(String(manifest.default_language)) ? [] : [`default_language must be one of languages: ${languages.join(', ')}`]
  for (const field of textFields.filter(key => has(manifest, key))) {
    const text = manifest[field]
    const keys = isObject(text) ? Object.keys(text).sort().join(', ') : ''
    if (keys !== expected) problems.push(`${field} must be a language map with keys ${expected}, not ${keys || 'plain text'}`)
  }
  return problems
}

const checkTeam = (team: unknown): string[] => {
  if (!Array.isArray(team)) return team === undefined ? [] : ['team must be a list of people']
  const problems = team.flatMap((person, index) => {
    if (!isObject(person) || typeof person.name !== 'string' || !list(person.roles).length) return [`team[${index}] needs name and roles`]
    return list(person.roles).filter(role => !roles.includes(role)).map(role => `team[${index}] role ${role} is not one of: ${roles.join(', ')}`)
  })
  const hasOwner = team.some(person => isObject(person) && list(person.roles).includes('owner'))
  return hasOwner ? problems : [...problems, 'team needs a person with the owner role']
}

const checkPlatform = (manifest: Manifest, id: string, platform: Manifest): string[] => {
  const identifier = platform.identifier ?? manifest.identifier
  return [
    ...(platformIds.includes(id) ? [] : [`Unknown platform ${id} - use one of: ${platformIds.join(', ')}`]),
    ...list(platform.distribution).filter(store => !stores.includes(store)).map(store => `platforms.${id}.distribution: ${store} is not a store - use one of: ${stores.join(', ')}`),
    ...(installedPlatforms.includes(id) && identifier === undefined ? [`Missing identifier for platform ${id} - set identifier or platforms.${id}.identifier`] : []),
    ...(['android', 'ios'].includes(id) && !has(platform, 'min_version') ? [`Missing platforms.${id}.min_version`] : []),
    ...(id === 'ios' && !has(manifest, 'categories') ? ['Missing categories - the App Store needs a primary category'] : []),
    ...(id === 'firefox' && identifier !== undefined && !firefoxIdPattern.test(String(identifier)) ? [`Firefox ID ${identifier} must be a GUID or email-like, for example pumpkin-timer@johndoe.example - set platforms.firefox.identifier`] : []),
  ]
}

const checkPlatforms = (manifest: Manifest): string[] => {
  const platforms = isObject(manifest.platforms) ? manifest.platforms : {}
  const isMobileWithoutStorePlatform = manifest.type === 'mobile-app' && !has(platforms, 'android') && !has(platforms, 'ios')
  return [
    ...Object.entries(platforms).flatMap(([id, platform]) => checkPlatform(manifest, id, isObject(platform) ? platform : {})),
    ...list(manifest.distribution).filter(channel => !channels.includes(channel)).map(channel => `distribution: ${channel} is not one of ${channels.join(', ')} - stores go in platforms.<id>.distribution`),
    ...(isMobileWithoutStorePlatform ? ['mobile-app needs platforms.android or platforms.ios'] : []),
  ]
}

const checkFiles = (dir: string, manifest: Manifest): string[] => {
  const type = String(manifest.type)
  const files = [
    ...commonFiles,
    ...(noDocsTypes.includes(type) ? [] : docsFiles),
    ...(screenshotTypes.includes(type) ? ['docs/screenshots'] : []),
    ...[manifest.icon, manifest.entry_point].filter(file => typeof file === 'string'),
  ]
  const missing = files.filter(file => !fs.existsSync(path.join(dir, file))).map(file => `Missing file ${file}`)
  const hasLogo = logoFiles.some(file => fs.existsSync(path.join(dir, file)))
  return hasLogo ? missing : [...missing, `Missing file ${logoFiles.join(' or ')}`]
}

export const checkProject = (dir: string): string[] => {
  const text = readManifestText(dir)
  const manifest = parseManifest(text)
  return [...checkDuplicates(text), ...checkFields(manifest), ...checkLanguages(manifest), ...checkTeam(manifest.team), ...checkPlatforms(manifest), ...checkFiles(dir, manifest)]
}

#!/usr/bin/env bun
import { checkProject } from '../project/project.check'

const usage = 'Usage: project-convention check [projectPath]'
const [command, projectPath, ...extra] = process.argv.slice(2)

if (command === '-h' || command === '--help') {
  console.log(`${usage}\nChecks project.yml and the required files against the project structure convention. Exits with 1 when anything is missing or invalid.`)
} else if (command !== 'check' || extra.length) {
  console.error(usage)
  process.exitCode = 1
} else {
  try {
    const problems = checkProject(projectPath ?? process.cwd())
    console.log(problems.length ? problems.map(problem => `✗ ${problem}`).join('\n') : '✓ Follows the project structure convention')
    if (problems.length) process.exitCode = 1
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  }
}

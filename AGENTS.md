# AGENTS.md

## Project

The project structure convention: the layout, files and GitHub metadata that Tertium projects follow.

- `README.md`: the convention. The only specification.
- `project.yml`: this repository's own manifest.
- `project--example*.yml`: examples of `project.yml`, full and per platform.
- `src/`: the `project-convention check` command. Rules in `src/project/project.constants.ts`, tests in `src/project/project.test.ts`.
- `CHANGELOG.md`: version history, generated from commits by the release scripts.
- `LICENSE`: MIT.

## Rules

- Change the convention in `README.md` first. Then update the examples that show the changed part, and the check rules and tests in `src/` in the same commit.
- Before committing, run `bun test`, `bun run typecheck` and `bun run check`.
- Keep the README short: lists and tables, one line per rule, no tutorials.
- Write each rule once. Link to the section that owns it instead of repeating it.
- Use only standard tools and names. Do not name a personal or internal tool in the convention.
- Do not link to other repositories or local paths. Name them as plain text.
- Add a new file only when the convention needs it. Do not add notes, TODO files or docs.
- Do not edit `CHANGELOG.md` by hand. Describe each spec change in its commit message.
- Keep `project.yml` valid against the convention.

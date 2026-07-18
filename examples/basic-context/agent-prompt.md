# Agent Prompt

You are working in the repository `repolens`.

Task: add GitHub OAuth login

## Instructions

- Work from the files listed below before broad repository search.
- Preserve existing conventions and add/update tests where relevant.
- Report changed files and verification commands.

## Repository stack

- Node.js / JavaScript

## Start with these files

- `README.md`
- `test/relevance.test.js`
- `src/relevance.js`
- `src/cli.js`
- `package.json`
- `src/source.js`
- `test/generator.test.js`
- `.github/workflows/ci.yml`
- `src/generator.js`
- `src/gitignore.js`
- `src/scanner.js`
- `scripts/smoke-test.js`

## Architecture constraints inferred from repository shape

- Configuration and manifests define the project conventions; inspect them before adding dependencies or scripts.
- Entrypoint files should delegate to focused business logic where such layers exist.
- Tests should follow nearby examples instead of inventing new test structure.
- Documentation updates should live near existing docs or README patterns.

## Expected final response from the agent

- Summary of the change path
- Files inspected
- Files changed
- Tests or checks run
- Risks or follow-up work

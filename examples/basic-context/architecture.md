# Architecture Map

This is an automatically generated first-pass map. Treat it as a navigation layer for humans and AI coding agents, not as a replacement for reading source code.

## Project signals

- Root: `C:\Users\qzh\Documents\Codex\2026-07-18\new-chat\outputs\repolens`
- Source: `.`
- Detected stack: Node.js / JavaScript
- Files indexed: 14
- .gitignore rules loaded: 8

## Likely layers

### Documentation

- `README.md`

### Configuration and project metadata

- `package.json`

### General source files

- `src/cli.js`
- `src/generator.js`
- `src/gitignore.js`
- `src/relevance.js`
- `src/scanner.js`
- `src/source.js`
- `.github/workflows/ci.yml`

### Tests and verification

- `scripts/smoke-test.js`
- `test/cli.test.js`
- `test/generator.test.js`
- `test/gitignore.test.js`
- `test/relevance.test.js`

## Suggested verification commands

- npm test

## Agent guidance

- Prefer modifying files in the most specific layer for the task instead of touching broad entrypoints first.
- Check configuration files before introducing new tools, scripts, aliases, or framework conventions.
- Check tests near the relevant domain before adding new test patterns.
- If this map misses a domain, rerun RepoLens with a more specific `--task` description.

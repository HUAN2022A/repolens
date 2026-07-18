# Architecture Map

This is an automatically generated first-pass map. Treat it as a navigation layer for humans and AI coding agents, not as a replacement for reading source code.

## Project signals

- Root: `C:\Users\qzh\Documents\Codex\2026-07-18\new-chat\outputs\repolens`
- Source: `.`
- Detected stack: Node.js / JavaScript
- Files indexed: 45
- .gitignore rules loaded: 11
- Symbols detected: 219
- Imports detected: 55
- Internal dependency edges: 14
- Alias dependency edges: 0
- Unresolved relative imports: 1

## Likely layers

### Documentation

- `examples/README.md`
- `README.md`
- `CHANGELOG.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `docs/agent-setup.md`
- `docs/benchmark.md`
- `docs/demo.md`
- `docs/mcp.md`
- `docs/releases/v0.1.0.md`

### Configuration and project metadata

- `package.json`

### General source files

- `src/analyzer.js`
- `src/cli.js`
- `src/context.js`
- `src/generator.js`
- `src/gitignore.js`
- `src/graph.js`
- `src/mcp.js`
- `src/relevance.js`
- `src/scanner.js`
- `src/source.js`

### Tests and verification

- `scripts/pack-test.js`
- `scripts/smoke-test.js`
- `test/analyzer.test.js`
- `test/cli.test.js`
- `test/generator.test.js`
- `test/gitignore.test.js`
- `test/graph.test.js`
- `test/mcp.test.js`
- `test/relevance.test.js`

## Symbol hotspots

- `src/analyzer.js` — function lineForIndex, function dedupe, function analyzeFile, function analyzeRepository, const MAX_SYMBOLS_PER_FILE
- `src/cli.js` — function printHelp, function parseArgs, function main, const VERSION, const args
- `src/context.js` — function buildContextPack, function writeContextPack, const target, const source, const root
- `src/generator.js` — function lines, function topFiles, function groupByRole, function taskRelevantFiles, function inferCommands
- `src/gitignore.js` — function escapeRegex, function globToRegex, function parseLine, function loadGitignore, function isIgnoredByGitignore
- `src/graph.js` — function normalize, function withoutExtension, function candidatePathsFromBase, function candidatePaths, function stripJsonComments
- `src/mcp.js` — function send, function textContent, function callTool, function handle, const serverInfo
- `src/relevance.js` — function taskKeywords, function expandedKeywords, function countOccurrences, function scoreFileForTask, const STOP_WORDS
- `src/scanner.js` — function normalize, function isProbablySource, function detectRole, function scoreFile, function readPreview
- `src/source.js` — function isGitHubUrl, function toSshUrl, function run, function resolveSource, const GITHUB_REPO_PATTERN

## Import hotspots

- `src/cli.js` — ./context.js
- `src/context.js` — node:fs, node:fs/promises, node:path, ./scanner.js, ./generator.js
- `src/generator.js` — node:path, ./relevance.js
- `src/gitignore.js` — node:fs/promises, node:path
- `src/graph.js` — node:path
- `src/mcp.js` — ./context.js
- `src/scanner.js` — node:fs/promises, node:path, ./analyzer.js, ./graph.js, ./gitignore.js
- `src/source.js` — node:fs/promises, node:os, node:path, node:child_process
- `scripts/pack-test.js` — node:fs/promises, node:fs, node:os, node:child_process, node:path
- `scripts/smoke-test.js` — node:fs/promises, node:fs, node:child_process, node:path

## Internal dependency hotspots

- `src/analyzer.js` — 2 incoming edges
- `src/context.js` — 2 incoming edges
- `src/generator.js` — 2 incoming edges
- `src/gitignore.js` — 2 incoming edges
- `src/graph.js` — 2 incoming edges
- `src/relevance.js` — 2 incoming edges
- `src/scanner.js` — 1 incoming edge
- `src/source.js` — 1 incoming edge

## Suggested verification commands

- npm test

## Agent guidance

- Prefer modifying files in the most specific layer for the task instead of touching broad entrypoints first.
- Check configuration files before introducing new tools, scripts, aliases, or framework conventions.
- Check tests near the relevant domain before adding new test patterns.
- If this map misses a domain, rerun RepoLens with a more specific `--task` description.

# Task Context

Task: add GitHub OAuth login

## Most relevant files

- `README.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `examples/basic-context/task-context.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `examples/README.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `test/relevance.test.js` — Tests and verification; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `examples/basic-context/repo-map.json` — General source files; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `test/generator.test.js` — Tests and verification; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `src/relevance.js` — General source files; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"; content mentions "user"
- `docs/mcp.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `package.json` — Configuration and project metadata; content mentions "github"; content mentions "auth"
- `src/cli.js` — General source files; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "user"
- `docs/benchmark.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `docs/demo.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `src/source.js` — General source files; content mentions "github"
- `src/mcp.js` — General source files; content mentions "github"
- `.github/ISSUE_TEMPLATE/config.yml` — General source files; path matches "github"; content mentions "github"
- `.github/ISSUE_TEMPLATE/feature_request.yml` — General source files; path matches "github"; content mentions "user"
- `docs/agent-setup.md` — Documentation; content mentions "github"; content mentions "auth"; content mentions "user"
- `test/analyzer.test.js` — Tests and verification; content mentions "user"

## Why these files matter

### `README.md`

Role: Documentation

Symbols: None detected

Imports: None detected

Preview:

```md
# RepoLens

[![CI](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml/badge.svg)](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/HUAN2022A/repolens)](https://github.com/HUAN2022A/repolens/releases)
[![npm](https://img.shields.io/npm/v/@huan2022a/repolens?label=npm)](https://www.npmjs.com/package/@huan2022a/repolens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Give your AI coding agent the repo context it actually needs.

RepoLens turns a local project or public GitHub repository into a compact, task-aware context pack for Codex, Claude Code, Cursor, Gemini CLI, OpenCode, and other coding agents. Instead of dumping an entire codebase into an LLM, RepoLens finds high-signal files, explains why they matter, and writes agent-ready Markdown plus a machine-readable `repo-map.json`.

## Why RepoLens?

AI coding agents are powerful, but they still waste time and tokens reading the wrong files. RepoLens acts like a lightweight navigation layer before the agent starts editing:

- find the files that matter for a task;
- summarize the repository shape;
- expose project convent
```

### `examples/basic-context/task-context.md`

Role: Documentation

Symbols: None detected

Imports: None detected

Preview:

```md
# Task Context

Task: add GitHub OAuth login

## Most relevant files

- `README.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `examples/basic-context/task-context.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `examples/basic-context/repo-map.json` — General source files; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `examples/README.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `test/relevance.test.js` — Tests and verification; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `test/generator.test.js` — Tests and verification; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `src/relevance.js` — General source files; content mentions "oauth"; content mentions "login"; content mentions "auth"; con
```

### `examples/README.md`

Role: Documentation

Symbols: None detected

Imports: None detected

Preview:

```md
# Examples

This directory contains generated RepoLens context packs that show what the CLI produces.

- [`basic-context`](basic-context): generated from this repository with the task `add GitHub OAuth login` and the `codex` agent flavor.
```

### `test/relevance.test.js`

Role: Tests and verification

Symbols: function createSession, const authFile, const unrelatedFile, const colors, const authScore, const unrelatedScore

Imports: node:test, node:assert/strict, ../src/relevance.js

Preview:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreFileForTask } from '../src/relevance.js';

test('scores task-specific files above unrelated files', () => {
  const authFile = {
    path: 'src/auth/session.ts',
    role: 'business-logic',
    score: 10,
    preview: 'export function createSession(user, oauthToken) { return user.id }',
  };
  const unrelatedFile = {
    path: 'src/theme/colors.ts',
    role: 'ui',
    score: 10,
    preview: 'export const colors = { blue: "#00f" }',
  };

  const authScore = scoreFileForTask(authFile, 'add GitHub OAuth login');
  const unrelatedScore = scoreFileForTask(unrelatedFile, 'add GitHub OAuth login');

  assert.ok(authScore.score > unrelatedScore.score);
  assert.ok(authScore.reasons.some((reason) => reason.includes('auth') || reason.includes('oauth') || reason.includes('session')));
});
```

### `examples/basic-context/repo-map.json`

Role: General source files

Symbols: None detected

Imports: None detected

Preview:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-18T16:29:24.419Z",
  "repository": {
    "name": "repolens",
    "root": "C:\\Users\\qzh\\Documents\\Codex\\2026-07-18\\new-chat\\outputs\\repolens",
    "source": ".",
    "stack": [
      "Node.js / JavaScript"
    ]
  },
  "task": "add GitHub OAuth login",
  "agent": "codex",
  "stats": {
    "filesIndexed": 43,
    "roleCounts": {
      "docs": 18,
      "config": 1,
      "source": 15,
      "test": 9
    },
    "gitignoreRulesLoaded": 10,
    "symbolsDetected": 202,
    "importsDetected": 55,
    "filesWithSymbols": 19,
    "filesWithImports": 17,
    "dependencyEdges": 14,
    "unresolvedRelativeImports": 1,
    "filesWithOutgoingEdges": 10,
    "filesWithIncomingEdges": 8
  },
  "dependencyGraph": {
    "edges": [
      {
        "from": "src/cli.js",
        "to": "src/context.js",
        "source": "./context.js"
      },
      {
        "from": "src/context.js",
        "to": "src/scanner.js",
        "source": "./scanner.js"
      },
      {
        "from": "src/context.js",
        "to": "src/generator.js",
        "source": "./generator.js"
      },
      {
        "from": "src/context.js",
        "to": "src/source.js
```

### `test/generator.test.js`

Role: Tests and verification

Symbols: function login, const repo, const pack, const pack, const parsed, const pack

Imports: node:test, node:assert/strict, ../src/generator.js

Preview:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateContextPack } from '../src/generator.js';

const repo = {
  root: '/tmp/example',
  source: '/tmp/example',
  name: 'example',
  scannedAt: '2026-01-01T00:00:00.000Z',
  stack: ['Node.js / JavaScript'],
  roleCounts: { config: 1, source: 1 },
  gitignoreRules: [],
  analysis: { symbolCount: 1, importCount: 1, filesWithSymbols: 1, filesWithImports: 1 },
  graph: {
    edges: [{ from: 'src/auth.js', to: 'src/session.js', source: './session' }],
    unresolvedImports: [],
    summary: {
      edgeCount: 1,
      aliasEdgeCount: 0,
      unresolvedImportCount: 0,
      filesWithOutgoingEdges: 1,
      filesWithIncomingEdges: 1,
      aliasRules: [],
      hotspots: [{ file: 'src/session.js', incoming: 1 }],
    },
  },
  files: [
    { path: 'package.json', role: 'config', size: 2, extension: '.json', score: 50, symbols: [], imports: [], preview: '{"scripts":{"test":"node --test"}}' },
    { path: 'src/auth.js', role: 'source', size: 42, extension: '.js', score: 10, symbols: [{ name: 'login', kind: 'function', line: 1 }], imports: [{ source: './session' }], preview: 'function login() { return "oauth
```

### `src/relevance.js`

Role: General source files

Symbols: function taskKeywords, function expandedKeywords, function countOccurrences, function scoreFileForTask, const STOP_WORDS, const DOMAIN_HINTS, const expanded, const keywords

Imports: None detected

Preview:

```js
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'add', 'fix', 'make', 'this', 'that', 'from',
  'into', 'using', 'use', 'new', 'old', 'get', 'set', 'create', 'update'
]);

const DOMAIN_HINTS = [
  { keywords: ['auth', 'login', 'oauth', 'session', 'password', 'token'], hints: ['auth', 'login', 'session', 'user', 'middleware', 'provider'] },
  { keywords: ['payment', 'stripe', 'billing', 'invoice', 'webhook'], hints: ['payment', 'stripe', 'billing', 'invoice', 'webhook'] },
  { keywords: ['email', 'mail', 'notification', 'invite', 'invitation'], hints: ['email', 'mail', 'notification', 'template', 'invite'] },
  { keywords: ['api', 'route', 'endpoint', 'handler'], hints: ['api', 'route', 'endpoint', 'handler', 'controller'] },
  { keywords: ['database', 'db', 'schema', 'model', 'migration', 'prisma'], hints: ['schema', 'model', 'migration', 'prisma', 'database', 'db'] },
  { keywords: ['ui', 'page', 'component', 'button', 'form', 'style'], hints: ['component', 'page', 'ui', 'form', 'style', 'css'] },
  { keywords: ['test', 'spec', 'coverage'], hints: ['test', 'spec', '__tests__', 'fixtures'] },
  { keywords: ['config', 'build', 'script', 'dependency'], hints: ['config', '
```

### `docs/mcp.md`

Role: Documentation

Symbols: None detected

Imports: None detected

Preview:

```md
# MCP server

RepoLens includes a minimal Model Context Protocol-style stdio server for coding agents that can call tools.

## Run

```bash
node src/mcp.js
```

When installed as a package, use:

```bash
repolens-mcp
```

For client configuration snippets, see [`agent-setup.md`](agent-setup.md).

## Tools

### `generate_context`

Generate Markdown and/or JSON context files for a local path or public GitHub repository URL.

Input:

```json
{
  "target": ".",
  "task": "add GitHub OAuth login",
  "agent": "codex",
  "out": ".repolens",
  "outputMode": "all",
  "maxFiles": 800
}
```

Returns a JSON summary containing the output directory, generated files, repository source, and indexed file count.

### `repo_map`

Return a machine-readable `repo-map.json` payload without writing Markdown files.

Input:

```json
{
  "target": ".",
  "task": "fix payment webhook retries",
  "agent": "codex",
  "maxFiles": 800
}
```

### `find_relevant_files`

Return a compact list of the most relevant files for a task.

Input:

```json
{
  "target": ".",
  "task": "add GitHub OAuth login",
  "agent": "codex",
  "maxFiles": 800,
  "limit": 12
}
```

This is the best tool for an agent's first question: "w
```

### `package.json`

Role: Configuration and project metadata

Symbols: None detected

Imports: None detected

Preview:

```json
{
  "name": "@huan2022a/repolens",
  "version": "0.6.0",
  "description": "Generate compact, agent-ready context packs for AI coding agents.",
  "type": "module",
  "files": [
    "src/",
    "scripts/",
    "README.md",
    "LICENSE"
  ],
  "bin": {
    "repolens": "./src/cli.js",
    "repolens-mcp": "./src/mcp.js"
  },
  "scripts": {
    "start": "node src/cli.js",
    "test": "node --test test/*.test.js",
    "smoke": "node scripts/smoke-test.js",
    "pack:test": "node scripts/pack-test.js"
  },
  "keywords": [
    "ai",
    "coding-agent",
    "context-engineering",
    "repo-map",
    "developer-tools"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/HUAN2022A/repolens.git"
  },
  "homepage": "https://github.com/HUAN2022A/repolens#readme",
  "bugs": {
    "url": "https://github.com/HUAN2022A/repolens/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### `src/cli.js`

Role: General source files

Symbols: function printHelp, function parseArgs, function main, const VERSION, const args, const positional, const arg, const value

Imports: ./context.js

Preview:

```js
#!/usr/bin/env node
import { buildContextPack, writeContextPack } from './context.js';

const VERSION = '0.6.0';

function printHelp() {
  console.log(`RepoLens ${VERSION}

Generate compact, agent-ready context packs for AI coding agents.

Usage:
  repolens [path] [--task "task description"] [--out .repolens] [--for codex]

Examples:
  repolens .
  repolens https://github.com/user/repo
  repolens ./my-app --task "add GitHub OAuth login"
  repolens . --task "fix payment webhook retries" --for codex
  repolens . --json-only

Options:
  --task <text>    Task to generate focused context for
  --out <path>     Output directory, defaults to .repolens
  --for <agent>    Agent flavor: generic, codex, claude-code, cursor
  --max-files <n>  Maximum files to inspect, defaults to 800
  --json-only      Write only repo-map.json
  --markdown-only  Write only Markdown context files
  --help           Show help
  --version        Show version`);
}

function parseArgs(argv) {
  const args = {
    target: '.',
    task: '',
    out: '.repolens',
    agent: 'generic',
    maxFiles: 800,
    outputMode: 'all',
    jsonOnly: false,
    markdownOnly: false,
  };

  const positional = [];
  for (let i =
```

## Suggested implementation path for an AI coding agent

1. Read the highest-signal config and README files first.
2. Inspect the relevant domain files listed above.
3. Find nearby tests or examples before editing.
4. Make the smallest coherent change that follows existing project conventions.
5. Run the most relevant verification command.

## Suggested verification commands

- npm test

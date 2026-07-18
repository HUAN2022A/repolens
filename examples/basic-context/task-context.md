# Task Context

Task: add GitHub OAuth login

## Most relevant files

- `README.md` — Documentation; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "user"
- `test/relevance.test.js` — Tests and verification; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"
- `src/relevance.js` — General source files; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "session"; content mentions "user"
- `src/cli.js` — General source files; content mentions "github"; content mentions "oauth"; content mentions "login"; content mentions "auth"; content mentions "user"
- `package.json` — Configuration and project metadata; content mentions "auth"
- `src/source.js` — General source files; content mentions "github"
- `test/generator.test.js` — Tests and verification; content mentions "oauth"; content mentions "login"; content mentions "auth"
- `.github/workflows/ci.yml` — General source files; path matches "github"
- `src/generator.js` — General source files; high structural relevance
- `src/gitignore.js` — General source files; high structural relevance
- `src/scanner.js` — General source files; high structural relevance
- `scripts/smoke-test.js` — Tests and verification; high structural relevance
- `test/cli.test.js` — Tests and verification; high structural relevance
- `test/gitignore.test.js` — Tests and verification; high structural relevance

## Why these files matter

### `README.md`

Role: Documentation

Preview:

```md
# RepoLens

[![CI](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml/badge.svg)](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml)

RepoLens generates compact, agent-ready context packs for AI coding agents.

Instead of dumping an entire repository into a model, RepoLens scans the project, finds high-signal files, infers the repository shape, and writes Markdown context that can be pasted into Codex, Claude Code, Cursor, Gemini CLI, OpenCode, or another coding agent.

## Install / Run

This MVP has no runtime dependencies and requires Node.js 18+.

```bash
node src/cli.js .
node src/cli.js https://github.com/user/repo
node src/cli.js . --task "add GitHub OAuth login" --for codex
node src/cli.js . --json-only
```

If installed as a package, the command is:

```bash
repolens . --task "fix payment webhook retries"
```

## Output

RepoLens writes a `.repolens/` folder by default:

~~~txt
.repolens/
  overview.md
  architecture.md
  task-context.md
  agent-prompt.md
  repo-map.json
~~~

## What it does today

- Scans a local repository while ignoring dependency/build/cache directories.
- Scans a local repository or a public GitHub repository URL.
- Loads commo
```

### `test/relevance.test.js`

Role: Tests and verification

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

### `src/relevance.js`

Role: General source files

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

### `src/cli.js`

Role: General source files

Preview:

```js
#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scanRepository } from './scanner.js';
import { generateContextPack } from './generator.js';
import { isGitHubUrl, resolveSource } from './source.js';

const VERSION = '0.1.0';

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
  const args
```

### `package.json`

Role: Configuration and project metadata

Preview:

```json
{
  "name": "repolens",
  "version": "0.1.0",
  "description": "Generate compact, agent-ready context packs for AI coding agents.",
  "type": "module",
  "bin": {
    "repolens": "./src/cli.js"
  },
  "scripts": {
    "start": "node src/cli.js",
    "test": "node --test test/*.test.js",
    "smoke": "node scripts/smoke-test.js"
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
  "engines": {
    "node": ">=18"
  }
}
```

### `src/source.js`

Role: General source files

Preview:

```js
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const GITHUB_REPO_PATTERN = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i;

export function isGitHubUrl(input) {
  return GITHUB_REPO_PATTERN.test(input);
}

function toSshUrl(input) {
  const match = input.match(GITHUB_REPO_PATTERN);
  if (!match) return input;
  return `git@github.com:${match[1]}/${match[2].replace(/\.git$/i, '')}.git`;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}: ${stderr || stdout}`));
    })
```

### `test/generator.test.js`

Role: Tests and verification

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
  files: [
    { path: 'package.json', role: 'config', size: 2, extension: '.json', score: 50, preview: '{"scripts":{"test":"node --test"}}' },
    { path: 'src/auth.js', role: 'source', size: 42, extension: '.js', score: 10, preview: 'function login() { return "oauth" }' },
  ],
};

test('generates all files by default', () => {
  const pack = generateContextPack(repo, { task: 'add oauth login', agent: 'codex' });
  assert.deepEqual(Object.keys(pack.files).sort(), [
    'agent-prompt.md',
    'architecture.md',
    'overview.md',
    'repo-map.json',
    'task-context.md',
  ]);
});

test('supports JSON-only output mode', () => {
  const pack = generateContextPack(repo, { outputMode: 'json' });
  assert.deepEqual(Object.keys(pack.files), ['repo-map.json']);
  const parsed = JSON.parse(pack.files['repo-map.json']);
  assert.equal(parse
```

### `.github/workflows/ci.yml`

Role: General source files

Preview:

```yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  smoke:
    name: Smoke test on Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [18, 20]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Run unit tests
        run: npm test

      - name: Run smoke test
        run: npm run smoke
```

### `src/generator.js`

Role: General source files

Preview:

```js
import path from 'node:path';
import { scoreFileForTask } from './relevance.js';

const ROLE_LABELS = {
  config: 'Configuration and project metadata',
  entrypoint: 'Entrypoints, routes, and API surfaces',
  'business-logic': 'Business logic and services',
  ui: 'UI, pages, and components',
  test: 'Tests and verification',
  docs: 'Documentation',
  source: 'General source files',
};

function lines(items) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None detected';
}

function topFiles(repo, count = 18) {
  return repo.files.slice(0, count);
}

function groupByRole(files) {
  return files.reduce((acc, file) => {
    if (!acc[file.role]) acc[file.role] = [];
    acc[file.role].push(file);
    return acc;
  }, {});
}

function taskRelevantFiles(repo, task) {
  if (!task) return topFiles(repo, 16);
  return [...repo.files]
    .map((file) => {
      const relevance = scoreFileForTask(file, task);
      return { ...file, taskScore: relevance.score, relevanceReasons: relevance.reasons };
    })
    .sort((a, b) => b.taskScore - a.taskScore || a.path.localeCompare(b.path))
    .slice(0, 18);
}

function inferCommands(repo) {
  const packageJson = repo.fil
```

### `src/gitignore.js`

Role: General source files

Preview:

```js
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function escapeRegex(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(pattern) {
  const normalized = pattern.split(path.sep).join('/');
  const regex = escapeRegex(normalized)
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^/]*')
    .replace(/\\\?/g, '[^/]');
  return new RegExp(`^${regex}$`);
}

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (trimmed.startsWith('!')) return null;

  const anchored = trimmed.startsWith('/');
  const directoryOnly = trimmed.endsWith('/');
  const pattern = trimmed.replace(/^\//, '').replace(/\/$/, '');
  if (!pattern) return null;

  return {
    raw: trimmed,
    pattern,
    anchored,
    directoryOnly,
    regex: pattern.includes('*') || pattern.includes('?') ? globToRegex(pattern) : null,
  };
}

export async function loadGitignore(root) {
  try {
    const content = await readFile(path.join(root, '.gitignore'), 'utf8');
    return content.split(/\r?\n/).map(parseLine).filter(Boolean);
  } catch {
    return [];
  }
}

export function isIgnoredByGitignore
```

## Suggested implementation path for an AI coding agent

1. Read the highest-signal config and README files first.
2. Inspect the relevant domain files listed above.
3. Find nearby tests or examples before editing.
4. Make the smallest coherent change that follows existing project conventions.
5. Run the most relevant verification command.

## Suggested verification commands

- npm test

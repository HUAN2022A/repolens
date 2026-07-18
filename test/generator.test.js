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
  assert.equal(parsed.schemaVersion, 1);
});

test('supports Markdown-only output mode', () => {
  const pack = generateContextPack(repo, { outputMode: 'markdown' });
  assert.equal(Object.keys(pack.files).includes('repo-map.json'), false);
  assert.equal(Object.keys(pack.files).length, 4);
});

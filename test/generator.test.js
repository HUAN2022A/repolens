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
    { path: 'src/auth.js', role: 'source', size: 42, extension: '.js', score: 10, symbols: [{ name: 'login', kind: 'function', line: 1 }], imports: [{ source: './session' }], preview: 'function login() { return "oauth" }' },
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
  assert.equal(parsed.stats.symbolsDetected, 1);
  assert.equal(parsed.stats.dependencyEdges, 1);
  assert.equal(parsed.stats.aliasDependencyEdges, 0);
  assert.equal(parsed.dependencyGraph.edges[0].to, 'src/session.js');
  assert.deepEqual(parsed.dependencyGraph.aliasRules, []);
  assert.deepEqual(parsed.files.find((file) => file.path === 'src/auth.js').symbols[0].name, 'login');
});

test('supports Markdown-only output mode', () => {
  const pack = generateContextPack(repo, { outputMode: 'markdown' });
  assert.equal(Object.keys(pack.files).includes('repo-map.json'), false);
  assert.equal(Object.keys(pack.files).length, 4);
});

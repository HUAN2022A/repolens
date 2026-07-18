import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDependencyGraph } from '../src/graph.js';

test('resolves relative JS imports to files', () => {
  const graph = buildDependencyGraph([
    { path: 'src/index.ts', imports: [{ source: './utils' }, { source: './feature/button' }] },
    { path: 'src/utils.ts', imports: [] },
    { path: 'src/feature/button/index.ts', imports: [] },
  ]);

  assert.deepEqual(graph.edges, [
    { from: 'src/index.ts', to: 'src/utils.ts', source: './utils', kind: 'relative', alias: undefined },
    { from: 'src/index.ts', to: 'src/feature/button/index.ts', source: './feature/button', kind: 'relative', alias: undefined },
  ]);
  assert.equal(graph.summary.edgeCount, 2);
  assert.equal(graph.summary.filesWithIncomingEdges, 2);
});

test('resolves tsconfig path aliases and common @ convention', () => {
  const graph = buildDependencyGraph([
    { path: 'tsconfig.json', preview: '{"compilerOptions":{"baseUrl":".","paths":{"~/*":["src/*"]}}}', imports: [] },
    { path: 'src/index.ts', imports: [{ source: '~/lib/api' }, { source: '@/components/button' }] },
    { path: 'src/lib/api.ts', imports: [] },
    { path: 'src/components/button.tsx', imports: [] },
  ]);

  assert.deepEqual(graph.edges, [
    { from: 'src/index.ts', to: 'src/lib/api.ts', source: '~/lib/api', kind: 'alias', alias: '~/' },
    { from: 'src/index.ts', to: 'src/components/button.tsx', source: '@/components/button', kind: 'alias', alias: '@/' },
  ]);
  assert.equal(graph.summary.aliasEdgeCount, 2);
  assert.ok(graph.summary.aliasRules.some((rule) => rule.prefix === '~/'));
});

test('tracks unresolved relative imports but ignores external packages', () => {
  const graph = buildDependencyGraph([
    { path: 'src/index.ts', imports: [{ source: './missing' }, { source: 'react' }] },
  ]);

  assert.equal(graph.edges.length, 0);
  assert.deepEqual(graph.unresolvedImports, [{ from: 'src/index.ts', source: './missing' }]);
});

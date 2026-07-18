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
    { from: 'src/index.ts', to: 'src/utils.ts', source: './utils' },
    { from: 'src/index.ts', to: 'src/feature/button/index.ts', source: './feature/button' },
  ]);
  assert.equal(graph.summary.edgeCount, 2);
  assert.equal(graph.summary.filesWithIncomingEdges, 2);
});

test('tracks unresolved relative imports but ignores external packages', () => {
  const graph = buildDependencyGraph([
    { path: 'src/index.ts', imports: [{ source: './missing' }, { source: 'react' }] },
  ]);

  assert.equal(graph.edges.length, 0);
  assert.deepEqual(graph.unresolvedImports, [{ from: 'src/index.ts', source: './missing' }]);
});

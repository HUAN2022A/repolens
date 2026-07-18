import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeImpact } from '../src/impact.js';

const repoMap = {
  repository: { name: 'demo' },
  files: [
    { path: 'src/auth.ts', role: 'source', symbols: [{ kind: 'function', name: 'login', line: 1 }], imports: [{ source: './session' }] },
    { path: 'src/session.ts', role: 'source', symbols: [{ kind: 'function', name: 'session', line: 1 }], imports: [] },
    { path: 'src/app.ts', role: 'source', symbols: [], imports: [{ source: './auth' }] },
    { path: 'test/auth.test.ts', role: 'test', symbols: [], imports: [{ source: '../src/auth' }] },
  ],
  dependencyGraph: {
    edges: [
      { from: 'src/auth.ts', to: 'src/session.ts', source: './session', kind: 'relative' },
      { from: 'src/app.ts', to: 'src/auth.ts', source: './auth', kind: 'relative' },
      { from: 'test/auth.test.ts', to: 'src/auth.ts', source: '../src/auth', kind: 'relative' },
    ],
  },
};

test('analyzes file impact from dependency graph', () => {
  const impact = analyzeImpact(repoMap, 'src/auth.ts');
  assert.equal(impact.impact.outgoingCount, 1);
  assert.equal(impact.impact.incomingCount, 2);
  assert.equal(impact.impact.riskLevel, 'medium');
  assert.deepEqual(impact.suggestedFiles.map((file) => file.path), ['src/session.ts', 'src/app.ts', 'test/auth.test.ts']);
  assert.equal(impact.nearbyTests[0].path, 'test/auth.test.ts');
});

test('throws for files outside the repo map', () => {
  assert.throws(() => analyzeImpact(repoMap, 'src/missing.ts'), /File not found/);
});

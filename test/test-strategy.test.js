import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTestStrategy } from '../src/test-strategy.js';

const repoMap = {
  repository: { name: 'demo' },
  task: 'change auth login',
  relevantFiles: [
    { path: 'src/auth.ts', role: 'source' },
    { path: 'test/auth.test.ts', role: 'test' },
  ],
  files: [
    { path: 'package.json', role: 'config' },
    { path: 'src/auth.ts', role: 'source', symbols: [], imports: [] },
    { path: 'src/session.ts', role: 'source', symbols: [], imports: [] },
    { path: 'test/auth.test.ts', role: 'test', symbols: [], imports: [] },
  ],
  dependencyGraph: {
    edges: [
      { from: 'src/auth.ts', to: 'src/session.ts', source: './session', kind: 'relative' },
      { from: 'test/auth.test.ts', to: 'src/auth.ts', source: '../src/auth', kind: 'relative' },
    ],
  },
};

test('generates a test strategy from task and target file', () => {
  const strategy = generateTestStrategy(repoMap, { file: 'src/auth.ts', task: 'change auth login' });
  assert.deepEqual(strategy.commands, ['npm test']);
  assert.equal(strategy.testsToRun[0].path, 'test/auth.test.ts');
  assert.ok(strategy.filesToInspectBeforeTesting.some((file) => file.path === 'src/session.ts'));
  assert.equal(strategy.coverageGaps.length, 0);
});

test('reports coverage gap when no tests are found', () => {
  const strategy = generateTestStrategy({ ...repoMap, files: repoMap.files.filter((file) => file.role !== 'test'), relevantFiles: [] }, { file: 'src/session.ts' });
  assert.equal(strategy.coverageGaps.length, 1);
  assert.equal(strategy.riskLevel, 'medium');
});

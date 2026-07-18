import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFile } from '../src/analyzer.js';

test('extracts JavaScript and TypeScript symbols and imports', () => {
  const result = analyzeFile({
    extension: '.ts',
    preview: `import { readFile } from 'node:fs/promises';
import helper from './helper';
export interface User { id: string }
export type Role = 'admin';
export async function loadUser() {}
export const userStore = {};`,
  });

  assert.deepEqual(result.imports.map((item) => item.source), ['node:fs/promises', './helper']);
  assert.ok(result.symbols.some((symbol) => symbol.kind === 'interface' && symbol.name === 'User'));
  assert.ok(result.symbols.some((symbol) => symbol.kind === 'function' && symbol.name === 'loadUser'));
  assert.ok(result.symbols.some((symbol) => symbol.kind === 'const' && symbol.name === 'userStore'));
});

test('extracts Python symbols and imports', () => {
  const result = analyzeFile({
    extension: '.py',
    preview: `import os
from pathlib import Path
class RepoLens:
    pass
def scan_repo():
    pass`,
  });

  assert.deepEqual(result.imports.map((item) => item.source), ['os', 'pathlib']);
  assert.ok(result.symbols.some((symbol) => symbol.kind === 'class' && symbol.name === 'RepoLens'));
  assert.ok(result.symbols.some((symbol) => symbol.kind === 'function' && symbol.name === 'scan_repo'));
});

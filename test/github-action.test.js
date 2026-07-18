import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import path from 'node:path';

function runAction(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/github-action.js'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('GitHub Action script generates context and sets outputs', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'repolens-action-test-'));
  try {
    const outDir = path.join(tempRoot, 'context');
    const outputFile = path.join(tempRoot, 'github-output.txt');
    const result = await runAction({
      INPUT_TARGET: '.',
      INPUT_TASK: 'validate github action script',
      INPUT_AGENT: 'codex',
      INPUT_OUT: outDir,
      INPUT_OUTPUT_MODE: 'json',
      INPUT_MAX_FILES: '200',
      GITHUB_OUTPUT: outputFile,
    });

    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /RepoLens generated 1 files/);
    assert.ok(existsSync(path.join(outDir, 'repo-map.json')));

    const outputs = await readFile(outputFile, 'utf8');
    assert.match(outputs, /output-dir=/);
    assert.match(outputs, /files=repo-map\.json/);
    assert.match(outputs, /files-indexed=\d+/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test('GitHub Action script rejects invalid output modes', async () => {
  const result = await runAction({ INPUT_OUTPUT_MODE: 'bad-mode' });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /output-mode must be one of/);
});

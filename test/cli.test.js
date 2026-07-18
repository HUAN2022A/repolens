import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['src/cli.js', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('rejects conflicting output modes', async () => {
  const result = await runCli(['.', '--json-only', '--markdown-only']);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /cannot be used together/);
});

test('rejects invalid max-files values', async () => {
  const result = await runCli(['.', '--max-files', 'nope']);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /positive integer/);
});

test('rejects unsupported agent flavors', async () => {
  const result = await runCli(['.', '--for', 'robot']);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /generic, codex, claude-code, cursor/);
});

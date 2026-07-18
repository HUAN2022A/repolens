#!/usr/bin/env node
import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, '.repolens-smoke-test');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await run(process.execPath, ['src/cli.js', '.', '--task', 'validate RepoLens smoke test', '--for', 'codex', '--out', '.repolens-smoke-test']);

  const expectedFiles = ['overview.md', 'architecture.md', 'task-context.md', 'agent-prompt.md', 'repo-map.json'];
  for (const file of expectedFiles) {
    const fullPath = path.join(outDir, file);
    if (!existsSync(fullPath)) throw new Error(`Missing smoke output: ${file}`);
  }

  const repoMap = JSON.parse(await readFile(path.join(outDir, 'repo-map.json'), 'utf8'));
  if (repoMap.schemaVersion !== 1) throw new Error('Unexpected repo-map schema version');
  if (!Array.isArray(repoMap.files) || repoMap.files.length === 0) throw new Error('repo-map has no indexed files');
  if (!Array.isArray(repoMap.relevantFiles) || repoMap.relevantFiles.length === 0) throw new Error('repo-map has no relevant files');
  if (typeof repoMap.stats.symbolsDetected !== 'number') throw new Error('repo-map is missing symbol stats');
  if (!repoMap.files.every((file) => Array.isArray(file.symbols) && Array.isArray(file.imports))) {
    throw new Error('repo-map files must include symbols and imports arrays');
  }

  console.log('RepoLens smoke test passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

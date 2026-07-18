#!/usr/bin/env node
import { mkdtemp, rm, readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? root,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: process.platform === 'win32',
    });
    let stdout = '';
    let stderr = '';
    if (options.capture) {
      child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}\n${stderr}`));
    });
  });
}

async function main() {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'repolens-pack-test-'));
  try {
    const pack = await run(npmCommand, ['pack', '--silent'], { capture: true });
    const tarball = pack.stdout.trim().split(/\r?\n/).at(-1);
    if (!tarball) throw new Error('npm pack did not produce a tarball name');
    const tarballPath = path.join(root, tarball);
    if (!existsSync(tarballPath)) throw new Error(`Missing tarball: ${tarballPath}`);

    await run(npmCommand, ['init', '-y', '--silent'], { cwd: tempRoot });
    await run(npmCommand, ['install', '--silent', tarballPath], { cwd: tempRoot });

    const version = await run(npxCommand, ['repolens', '--version'], { cwd: tempRoot, capture: true });
    if (!version.stdout.trim()) throw new Error('Installed repolens did not print a version');

    await run(npxCommand, ['repolens', root, '--task', 'validate-packed-cli', '--json-only', '--out', 'repolens-pack-output'], { cwd: tempRoot });
    const output = path.join(root, 'repolens-pack-output', 'repo-map.json');
    if (!existsSync(output)) throw new Error('Packed CLI did not generate repo-map.json');
    const repoMap = JSON.parse(await readFile(output, 'utf8'));
    if (repoMap.schemaVersion !== 1) throw new Error('Unexpected repo-map schema version from packed CLI');

    const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    const installedPackagePath = packageJson.name.startsWith('@')
      ? path.join(tempRoot, 'node_modules', ...packageJson.name.split('/'))
      : path.join(tempRoot, 'node_modules', packageJson.name);
    const installedFiles = await readdir(installedPackagePath);
    console.log(`Packed CLI test passed with repolens ${version.stdout.trim()}.`);
    console.log(`Installed package files: ${installedFiles.sort().join(', ')}`);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { appendFile } from 'node:fs/promises';
import { buildContextPack, writeContextPack } from '../src/context.js';

function getInput(name, fallback = '') {
  const envName = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`;
  const value = process.env[envName];
  return value === undefined || value === '' ? fallback : value;
}

function parseMaxFiles(value) {
  const maxFiles = Number.parseInt(value, 10);
  if (!Number.isInteger(maxFiles) || maxFiles < 1) {
    throw new Error('max-files must be a positive integer');
  }
  return maxFiles;
}

function parseOutputMode(value) {
  if (!['all', 'json', 'markdown'].includes(value)) {
    throw new Error('output-mode must be one of: all, json, markdown');
  }
  return value;
}

async function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  const safeValue = String(value).replace(/\r/g, '').replace(/\n/g, ' ');
  await appendFile(outputPath, `${name}=${safeValue}\n`, 'utf8');
}

async function main() {
  const options = {
    target: getInput('target', '.'),
    task: getInput('task', ''),
    agent: getInput('agent', 'generic'),
    out: getInput('out', '.repolens'),
    maxFiles: parseMaxFiles(getInput('max-files', '800')),
    outputMode: parseOutputMode(getInput('output-mode', 'all')),
  };

  const { pack, outDir, repo } = await buildContextPack(options);
  await writeContextPack(pack, outDir);

  const files = Object.keys(pack.files);
  await setOutput('output-dir', outDir);
  await setOutput('files', files.join(','));
  await setOutput('files-indexed', repo.files.length);

  console.log(`RepoLens generated ${files.length} files in ${outDir}`);
  console.log(`Indexed ${repo.files.length} repository files.`);
  for (const file of files) console.log(`- ${file}`);
}

main().catch((error) => {
  console.error(`RepoLens action error: ${error.message}`);
  process.exitCode = 1;
});

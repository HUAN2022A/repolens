#!/usr/bin/env node
import { buildContextPack, writeContextPack } from './context.js';

const VERSION = '1.0.0';

function printHelp() {
  console.log(`RepoLens ${VERSION}

Generate compact, agent-ready context packs for AI coding agents.

Usage:
  repolens [path] [--task "task description"] [--out .repolens] [--for codex]

Examples:
  repolens .
  repolens https://github.com/user/repo
  repolens ./my-app --task "add GitHub OAuth login"
  repolens . --task "fix payment webhook retries" --for codex
  repolens . --json-only

Options:
  --task <text>    Task to generate focused context for
  --out <path>     Output directory, defaults to .repolens
  --for <agent>    Agent flavor: generic, codex, claude-code, cursor
  --max-files <n>  Maximum files to inspect, defaults to 800
  --json-only      Write only repo-map.json
  --markdown-only  Write only Markdown context files
  --help           Show help
  --version        Show version`);
}

function parseArgs(argv) {
  const args = {
    target: '.',
    task: '',
    out: '.repolens',
    agent: 'generic',
    maxFiles: 800,
    outputMode: 'all',
    jsonOnly: false,
    markdownOnly: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--task') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--task requires a non-empty value');
      args.task = value;
      continue;
    }
    if (arg === '--out') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--out requires a directory path');
      args.out = value;
      continue;
    }
    if (arg === '--for') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--for requires an agent name');
      args.agent = value;
      continue;
    }
    if (arg === '--max-files') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('--max-files requires a positive integer');
      args.maxFiles = Number.parseInt(value, 10);
      continue;
    }
    if (arg === '--json-only') {
      args.jsonOnly = true;
      args.outputMode = 'json';
      continue;
    }
    if (arg === '--markdown-only') {
      args.markdownOnly = true;
      args.outputMode = 'markdown';
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  if (positional[0]) args.target = positional[0];
  if (positional.length > 1) throw new Error(`Expected one target path or URL, received ${positional.length}`);
  if (!Number.isInteger(args.maxFiles) || args.maxFiles < 1) {
    throw new Error('--max-files must be a positive integer');
  }
  if (args.jsonOnly && args.markdownOnly) {
    throw new Error('--json-only and --markdown-only cannot be used together');
  }
  if (!['generic', 'codex', 'claude-code', 'cursor'].includes(args.agent)) {
    throw new Error('--for must be one of: generic, codex, claude-code, cursor');
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (args.version) {
    console.log(VERSION);
    return;
  }

  const { pack, outDir } = await buildContextPack({
    target: args.target,
    task: args.task,
    agent: args.agent,
    out: args.out,
    maxFiles: args.maxFiles,
    outputMode: args.outputMode,
  });
  await writeContextPack(pack, outDir);

  console.log(`RepoLens generated ${Object.keys(pack.files).length} files in ${outDir}`);
  for (const fileName of Object.keys(pack.files)) {
    console.log(`- ${fileName}`);
  }
}

main().catch((error) => {
  console.error(`RepoLens error: ${error.message}`);
  process.exitCode = 1;
});

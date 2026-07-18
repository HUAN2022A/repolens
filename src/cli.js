#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scanRepository } from './scanner.js';
import { generateContextPack } from './generator.js';
import { isGitHubUrl, resolveSource } from './source.js';

const VERSION = '0.1.0';

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

Options:
  --task <text>    Task to generate focused context for
  --out <path>     Output directory, defaults to .repolens
  --for <agent>    Agent flavor: generic, codex, claude-code, cursor
  --max-files <n>  Maximum files to inspect, defaults to 800
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
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--task') {
      args.task = argv[++i] ?? '';
      continue;
    }
    if (arg === '--out') {
      args.out = argv[++i] ?? '.repolens';
      continue;
    }
    if (arg === '--for') {
      args.agent = argv[++i] ?? 'generic';
      continue;
    }
    if (arg === '--max-files') {
      args.maxFiles = Number.parseInt(argv[++i] ?? '800', 10);
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  if (positional[0]) args.target = positional[0];
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

  const source = await resolveSource(args.target);
  try {
    const root = source.root;
    if (!existsSync(root)) {
      throw new Error(`Target path does not exist: ${root}`);
    }

    const outDir = isGitHubUrl(args.target)
      ? path.resolve(process.cwd(), args.out)
      : path.resolve(root, args.out);
    const repo = await scanRepository(root, {
      maxFiles: args.maxFiles,
      source: source.displayTarget,
    });
    const pack = generateContextPack(repo, {
      task: args.task,
      agent: args.agent,
      outDir,
    });

    await mkdir(outDir, { recursive: true });
    await Promise.all(
      Object.entries(pack.files).map(([fileName, content]) =>
        writeFile(path.join(outDir, fileName), content, 'utf8')
      )
    );

    console.log(`RepoLens generated ${Object.keys(pack.files).length} files in ${outDir}`);
    for (const fileName of Object.keys(pack.files)) {
      console.log(`- ${fileName}`);
    }
  } finally {
    await source.cleanup();
  }
}

main().catch((error) => {
  console.error(`RepoLens error: ${error.message}`);
  process.exitCode = 1;
});

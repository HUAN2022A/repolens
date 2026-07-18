import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scanRepository } from './scanner.js';
import { generateContextPack } from './generator.js';
import { isGitHubUrl, resolveSource } from './source.js';

export async function buildContextPack(options = {}) {
  const target = options.target ?? '.';
  const source = await resolveSource(target);
  try {
    const root = source.root;
    if (!existsSync(root)) {
      throw new Error(`Target path does not exist: ${root}`);
    }

    const outDir = isGitHubUrl(target)
      ? path.resolve(process.cwd(), options.out ?? '.repolens')
      : path.resolve(root, options.out ?? '.repolens');
    const repo = await scanRepository(root, {
      maxFiles: options.maxFiles ?? 800,
      source: source.displayTarget,
    });
    const pack = generateContextPack(repo, {
      task: options.task ?? '',
      agent: options.agent ?? 'generic',
      outDir,
      outputMode: options.outputMode ?? 'all',
    });

    return { repo, pack, outDir };
  } finally {
    await source.cleanup();
  }
}

export async function writeContextPack(pack, outDir) {
  await mkdir(outDir, { recursive: true });
  await Promise.all(
    Object.entries(pack.files).map(([fileName, content]) =>
      writeFile(path.join(outDir, fileName), content, 'utf8')
    )
  );
}

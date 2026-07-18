import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { isIgnoredByGitignore, loadGitignore } from './gitignore.js';

const DEFAULT_IGNORE_DIRS = new Set([
  '.git', '.hg', '.svn', 'node_modules', 'dist', 'build', 'out', 'coverage',
  '.next', '.nuxt', '.svelte-kit', '.turbo', '.cache', 'target', 'vendor',
  '__pycache__', '.pytest_cache', '.mypy_cache', '.venv', 'venv', 'env',
  '.repolens', '.repolens-smoke'
]);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz',
  '.tar', '.tgz', '.7z', '.exe', '.dll', '.so', '.dylib', '.class', '.jar',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mov', '.mp3', '.wav'
]);

const IMPORTANT_FILENAMES = new Set([
  'package.json', 'tsconfig.json', 'jsconfig.json', 'vite.config.ts',
  'vite.config.js', 'next.config.js', 'next.config.mjs', 'pyproject.toml',
  'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml', 'build.gradle',
  'README.md', 'readme.md', 'Dockerfile', 'docker-compose.yml', '.env.example'
]);

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function isProbablySource(filePath) {
  return /\.(js|jsx|ts|tsx|mjs|cjs|py|go|rs|java|kt|cs|rb|php|swift|vue|svelte|astro|md|mdx|json|toml|yaml|yml|css|scss|html)$/i.test(filePath);
}

function detectRole(relativePath) {
  const p = relativePath.toLowerCase();
  const base = path.basename(p);
  if (base.includes('test') || base.includes('spec') || p.includes('/test') || p.includes('/__tests__/')) return 'test';
  if (p.includes('/docs/') || base.endsWith('.md') || base.endsWith('.mdx')) return 'docs';
  if (IMPORTANT_FILENAMES.has(path.basename(relativePath))) return 'config';
  if (p.includes('/api/') || p.includes('/routes/') || p.includes('/controllers/')) return 'entrypoint';
  if (p.includes('/components/') || p.includes('/pages/') || p.includes('/app/')) return 'ui';
  if (p.includes('/services/') || p.includes('/domain/') || p.includes('/server/')) return 'business-logic';
  return 'source';
}

function scoreFile(relativePath) {
  const p = relativePath.toLowerCase();
  const base = path.basename(relativePath);
  let score = 0;
  if (IMPORTANT_FILENAMES.has(base)) score += 50;
  if (/readme/i.test(base)) score += 40;
  if (p.includes('/src/') || p.startsWith('src/')) score += 15;
  if (p.includes('/app/') || p.includes('/api/') || p.includes('/server/')) score += 15;
  if (p.includes('/test') || p.includes('/__tests__/')) score += 8;
  if (p.includes('/types') || p.includes('/models') || p.includes('/schema')) score += 10;
  if (p.includes('node_modules') || p.includes('lock')) score -= 100;
  return score;
}

async function readPreview(fullPath) {
  const text = await readFile(fullPath, 'utf8');
  return text.slice(0, 4000);
}

async function walk(root, current, files, options) {
  if (files.length >= options.maxFiles) return;
  const entries = await readdir(current, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (files.length >= options.maxFiles) break;
    const fullPath = path.join(current, entry.name);
    const relativePath = normalize(path.relative(root, fullPath));
    if (entry.isDirectory()) {
      if (DEFAULT_IGNORE_DIRS.has(entry.name)) continue;
      if (isIgnoredByGitignore(relativePath, true, options.gitignoreRules)) continue;
      await walk(root, fullPath, files, options);
      continue;
    }
    if (!entry.isFile()) continue;
    if (isIgnoredByGitignore(relativePath, false, options.gitignoreRules)) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (BINARY_EXTENSIONS.has(extension)) continue;
    if (!isProbablySource(entry.name) && !IMPORTANT_FILENAMES.has(entry.name)) continue;

    const info = await stat(fullPath);
    if (info.size > 250_000) continue;

    let preview = '';
    try {
      preview = await readPreview(fullPath);
    } catch {
      continue;
    }

    files.push({
      path: relativePath,
      size: info.size,
      extension: extension || '(none)',
      role: detectRole(relativePath),
      score: scoreFile(relativePath),
      preview,
    });
  }
}

function detectStack(files) {
  const paths = new Set(files.map((file) => file.path));
  const stack = [];
  if (paths.has('package.json')) stack.push('Node.js / JavaScript');
  if ([...paths].some((p) => p.endsWith('.ts') || p.endsWith('.tsx'))) stack.push('TypeScript');
  if ([...paths].some((p) => p.includes('next.config'))) stack.push('Next.js');
  if ([...paths].some((p) => p.includes('vite.config'))) stack.push('Vite');
  if (paths.has('pyproject.toml') || paths.has('requirements.txt')) stack.push('Python');
  if (paths.has('go.mod')) stack.push('Go');
  if (paths.has('Cargo.toml')) stack.push('Rust');
  if (paths.has('pom.xml') || paths.has('build.gradle')) stack.push('Java');
  if (paths.has('Dockerfile') || paths.has('docker-compose.yml')) stack.push('Docker');
  return stack.length ? stack : ['Unknown / mixed'];
}

export async function scanRepository(root, options = {}) {
  const files = [];
  const gitignoreRules = await loadGitignore(root);
  await walk(root, root, files, { maxFiles: options.maxFiles ?? 800, gitignoreRules });
  files.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const roleCounts = files.reduce((acc, file) => {
    acc[file.role] = (acc[file.role] ?? 0) + 1;
    return acc;
  }, {});

  return {
    root,
    source: options.source ?? root,
    name: path.basename(root),
    scannedAt: new Date().toISOString(),
    stack: detectStack(files),
    files,
    roleCounts,
    gitignoreRules: gitignoreRules.map((rule) => rule.raw),
  };
}

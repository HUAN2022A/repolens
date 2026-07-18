import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const GITHUB_REPO_PATTERN = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i;

export function isGitHubUrl(input) {
  return GITHUB_REPO_PATTERN.test(input);
}

function toSshUrl(input) {
  const match = input.match(GITHUB_REPO_PATTERN);
  if (!match) return input;
  return `git@github.com:${match[1]}/${match[2].replace(/\.git$/i, '')}.git`;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}: ${stderr || stdout}`));
    });
  });
}

export async function resolveSource(input) {
  if (!isGitHubUrl(input)) {
    return {
      root: path.resolve(input),
      displayTarget: input,
      cleanup: async () => {},
    };
  }

  const tempRoot = await mkdtemp(path.join(tmpdir(), 'repolens-'));
  const repoDir = path.join(tempRoot, 'repo');
  try {
    await run('git', ['clone', '--depth', '1', input, repoDir]);
  } catch (error) {
    const sshUrl = toSshUrl(input);
    if (sshUrl === input) throw error;
    await run('git', ['clone', '--depth', '1', sshUrl, repoDir]);
  }

  return {
    root: repoDir,
    displayTarget: input,
    cleanup: async () => {
      await rm(tempRoot, { recursive: true, force: true });
    },
  };
}

import { readFile } from 'node:fs/promises';
import path from 'node:path';

function escapeRegex(text) {
  return text.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(pattern) {
  const normalized = pattern.split(path.sep).join('/');
  const regex = escapeRegex(normalized)
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^/]*')
    .replace(/\\\?/g, '[^/]');
  return new RegExp(`^${regex}$`);
}

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (trimmed.startsWith('!')) return null;

  const anchored = trimmed.startsWith('/');
  const directoryOnly = trimmed.endsWith('/');
  const pattern = trimmed.replace(/^\//, '').replace(/\/$/, '');
  if (!pattern) return null;

  return {
    raw: trimmed,
    pattern,
    anchored,
    directoryOnly,
    regex: pattern.includes('*') || pattern.includes('?') ? globToRegex(pattern) : null,
  };
}

export async function loadGitignore(root) {
  try {
    const content = await readFile(path.join(root, '.gitignore'), 'utf8');
    return content.split(/\r?\n/).map(parseLine).filter(Boolean);
  } catch {
    return [];
  }
}

export function isIgnoredByGitignore(relativePath, isDirectory, rules) {
  if (!rules.length) return false;
  const normalized = relativePath.split(path.sep).join('/');
  const segments = normalized.split('/');

  return rules.some((rule) => {
    if (rule.directoryOnly && !isDirectory && !normalized.includes(`${rule.pattern}/`)) {
      return false;
    }

    if (rule.regex) {
      if (rule.anchored) return rule.regex.test(normalized);
      return segments.some((_, index) => rule.regex.test(segments.slice(index).join('/')));
    }

    if (rule.anchored) {
      return normalized === rule.pattern || normalized.startsWith(`${rule.pattern}/`);
    }

    return segments.includes(rule.pattern) || normalized.startsWith(`${rule.pattern}/`) || normalized.includes(`/${rule.pattern}/`);
  });
}

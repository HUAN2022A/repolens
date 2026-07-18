import path from 'node:path';

const JS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const PY_EXTENSIONS = ['.py'];
const COMMON_EXTENSIONS = [...JS_EXTENSIONS, ...PY_EXTENSIONS, '.go', '.rs', '.java', '.kt'];

function normalize(filePath) {
  return filePath.split(path.sep).join('/');
}

function withoutExtension(filePath) {
  const extension = path.extname(filePath);
  return extension ? filePath.slice(0, -extension.length) : filePath;
}

function candidatePathsFromBase(base) {
  const extension = path.extname(base);
  if (extension) return [base];

  const candidates = [];
  for (const ext of COMMON_EXTENSIONS) candidates.push(`${base}${ext}`);
  for (const ext of COMMON_EXTENSIONS) candidates.push(`${base}/index${ext}`);
  return candidates;
}

function candidatePaths(fromPath, importSource) {
  if (!importSource.startsWith('.') && !importSource.startsWith('/')) return [];
  const fromDir = path.posix.dirname(fromPath);
  const base = normalize(path.posix.normalize(importSource.startsWith('/') ? importSource.slice(1) : path.posix.join(fromDir, importSource)));
  return candidatePathsFromBase(base);
}

function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function parseConfigAliases(file) {
  try {
    const parsed = JSON.parse(stripJsonComments(file.preview));
    const compilerOptions = parsed.compilerOptions ?? {};
    const baseUrl = normalize(compilerOptions.baseUrl ?? '.').replace(/^\.\//, '');
    const paths = compilerOptions.paths ?? {};
    return Object.entries(paths).flatMap(([pattern, targets]) => {
      if (!Array.isArray(targets)) return [];
      const prefix = pattern.replace(/\*.*$/, '');
      return targets.map((target) => ({
        prefix,
        targetPrefix: normalize(path.posix.join(baseUrl, target.replace(/\*.*$/, ''))).replace(/^\.\//, ''),
        source: file.path,
      }));
    });
  } catch {
    return [];
  }
}

function aliasRules(files) {
  const rules = files
    .filter((file) => ['tsconfig.json', 'jsconfig.json'].includes(path.posix.basename(file.path)))
    .flatMap(parseConfigAliases);

  const hasSrc = files.some((file) => file.path.startsWith('src/'));
  if (hasSrc && !rules.some((rule) => rule.prefix === '@/')) {
    rules.push({ prefix: '@/', targetPrefix: 'src/', source: 'convention:@/*' });
  }

  return rules.filter((rule) => rule.prefix && rule.targetPrefix);
}

function resolveCandidates(candidates, fileSet) {
  for (const candidate of candidates) {
    if (fileSet.has(candidate)) return candidate;
  }

  const extensionlessCandidates = candidates.map(withoutExtension);
  for (const filePath of fileSet) {
    if (extensionlessCandidates.includes(withoutExtension(filePath))) return filePath;
  }

  return null;
}

function resolveImport(fromPath, importSource, fileSet, rules) {
  const relativeTarget = resolveCandidates(candidatePaths(fromPath, importSource), fileSet);
  if (relativeTarget) return { target: relativeTarget, kind: 'relative' };

  for (const rule of rules) {
    if (!importSource.startsWith(rule.prefix)) continue;
    const rest = importSource.slice(rule.prefix.length);
    const base = normalize(path.posix.normalize(`${rule.targetPrefix}${rest}`));
    const target = resolveCandidates(candidatePathsFromBase(base), fileSet);
    if (target) return { target, kind: 'alias', alias: rule.prefix, aliasSource: rule.source };
  }

  return null;
}

export function buildDependencyGraph(files) {
  const fileSet = new Set(files.map((file) => file.path));
  const rules = aliasRules(files);
  const edges = [];
  const unresolvedImports = [];

  for (const file of files) {
    for (const item of file.imports ?? []) {
      const resolved = resolveImport(file.path, item.source, fileSet, rules);
      if (resolved) {
        edges.push({ from: file.path, to: resolved.target, source: item.source, kind: resolved.kind, alias: resolved.alias });
      } else if (item.source.startsWith('.') || item.source.startsWith('/') || rules.some((rule) => item.source.startsWith(rule.prefix))) {
        unresolvedImports.push({ from: file.path, source: item.source });
      }
    }
  }

  const incoming = new Map();
  const outgoing = new Map();
  for (const edge of edges) {
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, (outgoing.get(edge.from) ?? 0) + 1);
  }

  const hotspots = [...incoming.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([file, count]) => ({ file, incoming: count }));

  return {
    edges,
    unresolvedImports,
    summary: {
      edgeCount: edges.length,
      aliasEdgeCount: edges.filter((edge) => edge.kind === 'alias').length,
      unresolvedImportCount: unresolvedImports.length,
      filesWithOutgoingEdges: outgoing.size,
      filesWithIncomingEdges: incoming.size,
      aliasRules: rules,
      hotspots,
    },
  };
}

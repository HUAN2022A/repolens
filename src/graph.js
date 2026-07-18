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

function candidatePaths(fromPath, importSource) {
  if (!importSource.startsWith('.') && !importSource.startsWith('/')) return [];
  const fromDir = path.posix.dirname(fromPath);
  const base = normalize(path.posix.normalize(importSource.startsWith('/') ? importSource.slice(1) : path.posix.join(fromDir, importSource)));
  const extension = path.extname(base);
  if (extension) return [base];

  const candidates = [];
  for (const ext of COMMON_EXTENSIONS) candidates.push(`${base}${ext}`);
  for (const ext of COMMON_EXTENSIONS) candidates.push(`${base}/index${ext}`);
  return candidates;
}

function resolveImport(fromPath, importSource, fileSet) {
  for (const candidate of candidatePaths(fromPath, importSource)) {
    if (fileSet.has(candidate)) return candidate;
  }

  const extensionlessCandidates = candidatePaths(fromPath, importSource).map(withoutExtension);
  for (const filePath of fileSet) {
    if (extensionlessCandidates.includes(withoutExtension(filePath))) return filePath;
  }

  return null;
}

export function buildDependencyGraph(files) {
  const fileSet = new Set(files.map((file) => file.path));
  const edges = [];
  const unresolvedImports = [];

  for (const file of files) {
    for (const item of file.imports ?? []) {
      const target = resolveImport(file.path, item.source, fileSet);
      if (target) {
        edges.push({ from: file.path, to: target, source: item.source });
      } else if (item.source.startsWith('.') || item.source.startsWith('/')) {
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
      unresolvedImportCount: unresolvedImports.length,
      filesWithOutgoingEdges: outgoing.size,
      filesWithIncomingEdges: incoming.size,
      hotspots,
    },
  };
}

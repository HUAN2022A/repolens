function normalize(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function basenameWithoutExtension(filePath) {
  const base = normalize(filePath).split('/').at(-1) ?? filePath;
  return base.replace(/\.[^.]+$/, '').toLowerCase();
}

function isTestFile(filePath) {
  const p = normalize(filePath).toLowerCase();
  return p.includes('/test') || p.includes('/__tests__/') || /(?:test|spec)\.[^.]+$/.test(p);
}

function scoreTestForFile(testPath, filePath) {
  const test = normalize(testPath).toLowerCase();
  const target = normalize(filePath).toLowerCase();
  const targetName = basenameWithoutExtension(target);
  let score = 0;
  if (test.includes(targetName)) score += 30;
  const targetParts = target.split('/').slice(0, -1);
  for (const part of targetParts) {
    if (part && test.includes(part)) score += 5;
  }
  return score;
}

export function analyzeImpact(repoMap, filePath, options = {}) {
  const target = normalize(filePath);
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 20;
  const files = repoMap.files ?? [];
  const file = files.find((item) => item.path === target);
  if (!file) {
    throw new Error(`File not found in repo map: ${target}`);
  }

  const edges = repoMap.dependencyGraph?.edges ?? [];
  const outgoing = edges.filter((edge) => edge.from === target);
  const incoming = edges.filter((edge) => edge.to === target);

  const directlyRelated = new Set([
    ...outgoing.map((edge) => edge.to),
    ...incoming.map((edge) => edge.from),
  ]);

  const nearbyTests = files
    .filter((item) => isTestFile(item.path))
    .map((item) => ({ path: item.path, score: scoreTestForFile(item.path, target), role: item.role }))
    .filter((item) => item.score > 0 || directlyRelated.has(item.path))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, Math.min(limit, 10));

  const suggestedFiles = [...directlyRelated]
    .map((relatedPath) => files.find((item) => item.path === relatedPath))
    .filter(Boolean)
    .slice(0, limit)
    .map((item) => ({
      path: item.path,
      role: item.role,
      symbols: item.symbols ?? [],
      imports: item.imports ?? [],
    }));

  return {
    repository: repoMap.repository,
    file: {
      path: file.path,
      role: file.role,
      symbols: file.symbols ?? [],
      imports: file.imports ?? [],
    },
    impact: {
      outgoing,
      incoming,
      outgoingCount: outgoing.length,
      incomingCount: incoming.length,
      riskLevel: incoming.length >= 5 ? 'high' : incoming.length >= 2 ? 'medium' : 'low',
    },
    suggestedFiles,
    nearbyTests,
    guidance: [
      'Inspect outgoing dependencies before editing this file.',
      'Inspect incoming dependents to understand potential breakage.',
      nearbyTests.length ? 'Run or update the nearby tests listed here.' : 'No nearby tests were detected; consider adding focused coverage if behavior changes.',
    ],
  };
}

import { analyzeImpact } from './impact.js';

function isTestFile(filePath) {
  const p = filePath.toLowerCase();
  return p.includes('/test') || p.includes('/__tests__/') || /(?:test|spec)\.[^.]+$/.test(p);
}

function inferCommands(repoMap) {
  const paths = new Set((repoMap.files ?? []).map((file) => file.path));
  const commands = [];
  if (paths.has('package.json')) commands.push('npm test');
  if (paths.has('pyproject.toml') || paths.has('requirements.txt')) commands.push('python -m pytest');
  if (paths.has('go.mod')) commands.push('go test ./...');
  if (paths.has('Cargo.toml')) commands.push('cargo test');
  return commands.length ? commands : ['Run the project-specific test command from the repository docs or CI config.'];
}

function uniqueByPath(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item?.path || seen.has(item.path)) continue;
    seen.add(item.path);
    result.push(item);
  }
  return result;
}

function riskFromInputs(impacts, relevantFiles) {
  const incoming = impacts.reduce((sum, item) => sum + item.impact.incomingCount, 0);
  const testCount = relevantFiles.filter((file) => isTestFile(file.path)).length;
  if (incoming >= 6 || (incoming >= 3 && testCount === 0)) return 'high';
  if (incoming >= 2 || testCount === 0) return 'medium';
  return 'low';
}

export function generateTestStrategy(repoMap, options = {}) {
  const targetFiles = Array.isArray(options.files) && options.files.length
    ? options.files
    : options.file
      ? [options.file]
      : [];
  const relevantFiles = (repoMap.relevantFiles ?? []).slice(0, options.limit ?? 12);
  const impacts = [];

  for (const filePath of targetFiles) {
    try {
      impacts.push(analyzeImpact(repoMap, filePath, { limit: options.limit ?? 20 }));
    } catch {
      // Keep strategy generation useful even when a caller supplies one stale path.
    }
  }

  const impactedTests = impacts.flatMap((impact) => impact.nearbyTests ?? []);
  const relevantTests = (repoMap.files ?? [])
    .filter((file) => isTestFile(file.path))
    .filter((file) => {
      if (!options.task) return false;
      const haystack = file.path.toLowerCase();
      return String(options.task).toLowerCase().split(/[^a-z0-9_\-]+/).some((word) => word.length >= 3 && haystack.includes(word));
    })
    .map((file) => ({ path: file.path, role: file.role, reason: 'test path matches task keywords' }));

  const testsToRun = uniqueByPath([
    ...impactedTests.map((test) => ({ ...test, reason: 'near impacted file' })),
    ...relevantTests,
    ...relevantFiles.filter((file) => isTestFile(file.path)).map((file) => ({ path: file.path, role: file.role, reason: 'task-relevant test file' })),
  ]).slice(0, options.limit ?? 12);

  const commands = inferCommands(repoMap);
  const riskLevel = riskFromInputs(impacts, relevantFiles);

  return {
    repository: repoMap.repository,
    task: options.task ?? repoMap.task ?? null,
    targetFiles,
    riskLevel,
    commands,
    testsToRun,
    filesToInspectBeforeTesting: uniqueByPath([
      ...impacts.flatMap((impact) => impact.suggestedFiles ?? []),
      ...relevantFiles,
    ]).slice(0, options.limit ?? 12),
    coverageGaps: testsToRun.length
      ? []
      : ['No nearby or task-relevant tests were detected. Add focused tests if behavior changes.'],
    guidance: [
      'Run the broad verification command first when the change touches shared infrastructure.',
      'Run or update nearby tests for each impacted file.',
      'If no nearby tests exist, add a small regression test around the changed behavior.',
    ],
  };
}

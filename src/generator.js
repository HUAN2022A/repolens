import path from 'node:path';

const ROLE_LABELS = {
  config: 'Configuration and project metadata',
  entrypoint: 'Entrypoints, routes, and API surfaces',
  'business-logic': 'Business logic and services',
  ui: 'UI, pages, and components',
  test: 'Tests and verification',
  docs: 'Documentation',
  source: 'General source files',
};

function lines(items) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None detected';
}

function topFiles(repo, count = 18) {
  return repo.files.slice(0, count);
}

function groupByRole(files) {
  return files.reduce((acc, file) => {
    if (!acc[file.role]) acc[file.role] = [];
    acc[file.role].push(file);
    return acc;
  }, {});
}

function taskKeywords(task) {
  return task
    .toLowerCase()
    .split(/[^a-z0-9_\-]+/i)
    .filter((word) => word.length >= 3)
    .filter((word) => !['the', 'and', 'for', 'with', 'add', 'fix', 'make', 'this', 'that'].includes(word));
}

function scoreForTask(file, keywords) {
  const haystack = `${file.path}\n${file.preview.slice(0, 1200)}`.toLowerCase();
  return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 20 : 0), file.score);
}

function taskRelevantFiles(repo, task) {
  if (!task) return topFiles(repo, 16);
  const keywords = taskKeywords(task);
  return [...repo.files]
    .map((file) => ({ ...file, taskScore: scoreForTask(file, keywords) }))
    .sort((a, b) => b.taskScore - a.taskScore || a.path.localeCompare(b.path))
    .slice(0, 18);
}

function inferCommands(repo) {
  const packageJson = repo.files.find((file) => file.path === 'package.json');
  const commands = [];
  if (packageJson) {
    try {
      const parsed = JSON.parse(packageJson.preview);
      if (parsed.scripts?.dev) commands.push('npm run dev');
      if (parsed.scripts?.test) commands.push('npm test');
      if (parsed.scripts?.build) commands.push('npm run build');
      if (parsed.scripts?.lint) commands.push('npm run lint');
    } catch {
      commands.push('npm install');
    }
  }
  if (repo.files.some((file) => file.path === 'pyproject.toml')) commands.push('python -m pytest');
  if (repo.files.some((file) => file.path === 'go.mod')) commands.push('go test ./...');
  if (repo.files.some((file) => file.path === 'Cargo.toml')) commands.push('cargo test');
  return [...new Set(commands)];
}

function generateOverview(repo) {
  const grouped = groupByRole(repo.files);
  return `# RepoLens Overview: ${repo.name}

Generated at: ${repo.scannedAt}

## Detected stack

${lines(repo.stack)}

## Repository shape

${Object.entries(repo.roleCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([role, count]) => `- ${ROLE_LABELS[role] ?? role}: ${count}`)
  .join('\n')}

## Highest-signal files

${topFiles(repo, 20).map((file) => `- \`${file.path}\` — ${ROLE_LABELS[file.role] ?? file.role}`).join('\n')}

## Notable areas

${Object.entries(grouped)
  .map(([role, files]) => `### ${ROLE_LABELS[role] ?? role}\n\n${files.slice(0, 8).map((file) => `- \`${file.path}\``).join('\n')}`)
  .join('\n\n')}
`;
}

function generateArchitecture(repo) {
  const grouped = groupByRole(repo.files);
  const commands = inferCommands(repo);
  return `# Architecture Map

This is an automatically generated first-pass map. Treat it as a navigation layer for humans and AI coding agents, not as a replacement for reading source code.

## Project signals

- Root: \`${repo.root}\`
- Source: \`${repo.source ?? repo.root}\`
- Detected stack: ${repo.stack.join(', ')}
- Files indexed: ${repo.files.length}
- .gitignore rules loaded: ${repo.gitignoreRules?.length ?? 0}

## Likely layers

${Object.entries(grouped)
  .map(([role, files]) => `### ${ROLE_LABELS[role] ?? role}\n\n${files.slice(0, 10).map((file) => `- \`${file.path}\``).join('\n')}`)
  .join('\n\n')}

## Suggested verification commands

${lines(commands)}

## Agent guidance

- Prefer modifying files in the most specific layer for the task instead of touching broad entrypoints first.
- Check configuration files before introducing new tools, scripts, aliases, or framework conventions.
- Check tests near the relevant domain before adding new test patterns.
- If this map misses a domain, rerun RepoLens with a more specific \`--task\` description.
`;
}

function generateTaskContext(repo, task) {
  const relevant = taskRelevantFiles(repo, task);
  const commands = inferCommands(repo);
  return `# Task Context

Task: ${task ? task : 'No task provided. This is a general repository context pack.'}

## Most relevant files

${relevant.map((file) => `- \`${file.path}\` — ${ROLE_LABELS[file.role] ?? file.role}`).join('\n')}

## Why these files matter

${relevant.slice(0, 10).map((file) => `### \`${file.path}\`\n\nRole: ${ROLE_LABELS[file.role] ?? file.role}\n\nPreview:\n\n\`\`\`${path.extname(file.path).slice(1) || 'text'}\n${file.preview.slice(0, 1200).trim()}\n\`\`\``).join('\n\n')}

## Suggested implementation path for an AI coding agent

1. Read the highest-signal config and README files first.
2. Inspect the relevant domain files listed above.
3. Find nearby tests or examples before editing.
4. Make the smallest coherent change that follows existing project conventions.
5. Run the most relevant verification command.

## Suggested verification commands

${lines(commands)}
`;
}

function agentInstructions(agent) {
  if (agent === 'codex') {
    return '- Work from the files listed below before broad repository search.\n- Preserve existing conventions and add/update tests where relevant.\n- Report changed files and verification commands.';
  }
  if (agent === 'claude-code') {
    return '- Use this as the initial context pack.\n- Ask RepoLens/MCP-style follow-up questions only if the relevant domain is missing.\n- Avoid reading unrelated generated or dependency files.';
  }
  if (agent === 'cursor') {
    return '- Open the listed files as primary context.\n- Use previews to choose the exact symbols to inspect.\n- Keep edits localized to the matching layer.';
  }
  return '- Use the listed files as the first context window.\n- Avoid dumping the whole repository into the model.\n- Verify with the commands listed in this pack.';
}

function generateAgentPrompt(repo, task, agent) {
  const relevant = taskRelevantFiles(repo, task).slice(0, 12);
  return `# Agent Prompt

You are working in the repository \`${repo.name}\`.

Task: ${task ? task : 'Understand this repository and identify the safest next change path.'}

## Instructions

${agentInstructions(agent)}

## Repository stack

${lines(repo.stack)}

## Start with these files

${relevant.map((file) => `- \`${file.path}\``).join('\n')}

## Architecture constraints inferred from repository shape

- Configuration and manifests define the project conventions; inspect them before adding dependencies or scripts.
- Entrypoint files should delegate to focused business logic where such layers exist.
- Tests should follow nearby examples instead of inventing new test structure.
- Documentation updates should live near existing docs or README patterns.

## Expected final response from the agent

- Summary of the change path
- Files inspected
- Files changed
- Tests or checks run
- Risks or follow-up work
`;
}

export function generateContextPack(repo, options = {}) {
  const task = options.task ?? '';
  const agent = options.agent ?? 'generic';
  return {
    files: {
      'overview.md': generateOverview(repo),
      'architecture.md': generateArchitecture(repo),
      'task-context.md': generateTaskContext(repo, task),
      'agent-prompt.md': generateAgentPrompt(repo, task, agent),
    },
  };
}

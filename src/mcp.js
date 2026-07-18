#!/usr/bin/env node
import { buildContextPack, writeContextPack } from './context.js';
import { analyzeImpact } from './impact.js';

const serverInfo = { name: 'repolens', version: '0.7.0' };

const tools = [
  {
    name: 'generate_context',
    description: 'Generate RepoLens Markdown and/or JSON context files for a local path or public GitHub repository URL.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Local repository path or public GitHub URL.', default: '.' },
        task: { type: 'string', description: 'Task to focus context generation on.', default: '' },
        agent: { type: 'string', enum: ['generic', 'codex', 'claude-code', 'cursor'], default: 'generic' },
        out: { type: 'string', description: 'Output directory.', default: '.repolens' },
        outputMode: { type: 'string', enum: ['all', 'json', 'markdown'], default: 'all' },
        maxFiles: { type: 'integer', minimum: 1, default: 800 },
      },
    },
  },
  {
    name: 'repo_map',
    description: 'Return a machine-readable RepoLens repo map without writing Markdown files.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Local repository path or public GitHub URL.', default: '.' },
        task: { type: 'string', description: 'Task to focus relevance ranking on.', default: '' },
        agent: { type: 'string', enum: ['generic', 'codex', 'claude-code', 'cursor'], default: 'generic' },
        maxFiles: { type: 'integer', minimum: 1, default: 800 },
      },
    },
  },
  {
    name: 'find_relevant_files',
    description: 'Return the most relevant files for a task without writing files or returning the full repo map.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Local repository path or public GitHub URL.', default: '.' },
        task: { type: 'string', description: 'Task to focus relevance ranking on.', default: '' },
        agent: { type: 'string', enum: ['generic', 'codex', 'claude-code', 'cursor'], default: 'generic' },
        maxFiles: { type: 'integer', minimum: 1, default: 800 },
        limit: { type: 'integer', minimum: 1, default: 12 },
      },
    },
  },
  {
    name: 'impact_analysis',
    description: 'Analyze outgoing dependencies, incoming dependents, nearby tests, and suggested related files for a repository file.',
    inputSchema: {
      type: 'object',
      required: ['file'],
      properties: {
        target: { type: 'string', description: 'Local repository path or public GitHub URL.', default: '.' },
        file: { type: 'string', description: 'Repository-relative file path to analyze.' },
        task: { type: 'string', description: 'Optional task for repo-map relevance context.', default: '' },
        agent: { type: 'string', enum: ['generic', 'codex', 'claude-code', 'cursor'], default: 'generic' },
        maxFiles: { type: 'integer', minimum: 1, default: 800 },
        limit: { type: 'integer', minimum: 1, default: 20 },
      },
    },
  },
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function textContent(text) {
  return [{ type: 'text', text }];
}

async function callTool(name, args = {}) {
  if (name === 'generate_context') {
    const { pack, outDir, repo } = await buildContextPack(args);
    await writeContextPack(pack, outDir);
    return {
      content: textContent(JSON.stringify({
        outDir,
        files: Object.keys(pack.files),
        repository: repo.source ?? repo.root,
        filesIndexed: repo.files.length,
      }, null, 2)),
    };
  }

  if (name === 'repo_map') {
    const { pack } = await buildContextPack({ ...args, outputMode: 'json' });
    return { content: textContent(pack.files['repo-map.json']) };
  }

  if (name === 'find_relevant_files') {
    const limit = Number.isInteger(args.limit) && args.limit > 0 ? args.limit : 12;
    const { pack } = await buildContextPack({ ...args, outputMode: 'json' });
    const repoMap = JSON.parse(pack.files['repo-map.json']);
    return {
      content: textContent(JSON.stringify({
        repository: repoMap.repository,
        task: repoMap.task,
        files: repoMap.relevantFiles.slice(0, limit),
      }, null, 2)),
    };
  }

  if (name === 'impact_analysis') {
    if (!args.file) throw new Error('impact_analysis requires a file argument');
    const { pack } = await buildContextPack({ ...args, outputMode: 'json' });
    const repoMap = JSON.parse(pack.files['repo-map.json']);
    return { content: textContent(JSON.stringify(analyzeImpact(repoMap, args.file, args), null, 2)) };
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  if (message.method === 'initialize') {
    return {
      protocolVersion: message.params?.protocolVersion ?? '2024-11-05',
      capabilities: { tools: {} },
      serverInfo,
    };
  }
  if (message.method === 'notifications/initialized') return undefined;
  if (message.method === 'tools/list') return { tools };
  if (message.method === 'tools/call') {
    return callTool(message.params?.name, message.params?.arguments ?? {});
  }
  throw new Error(`Unsupported method: ${message.method}`);
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    if (!line.trim()) continue;
    void (async () => {
      let message;
      try {
        message = JSON.parse(line);
        const result = await handle(message);
        if (message.id !== undefined && result !== undefined) {
          send({ jsonrpc: '2.0', id: message.id, result });
        }
      } catch (error) {
        const id = message?.id ?? null;
        send({ jsonrpc: '2.0', id, error: { code: -32603, message: error.message } });
      }
    })();
  }
});

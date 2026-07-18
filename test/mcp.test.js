import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

function startServer() {
  const child = spawn(process.execPath, ['src/mcp.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const lines = [];
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    for (const line of chunk.split(/\r?\n/)) {
      if (line.trim()) lines.push(JSON.parse(line));
    }
  });
  return { child, lines };
}

async function sendAndWait(server, message) {
  const previousLength = server.lines.length;
  server.child.stdin.write(`${JSON.stringify(message)}\n`);
  for (let i = 0; i < 50; i += 1) {
    if (server.lines.length > previousLength) return server.lines.at(-1);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`Timed out waiting for response to ${message.method}`);
}

test('MCP server lists tools and returns a repo map', async () => {
  const server = startServer();
  try {
    const initialized = await sendAndWait(server, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05' },
    });
    assert.equal(initialized.result.serverInfo.name, 'repolens');

    const listed = await sendAndWait(server, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    assert.deepEqual(listed.result.tools.map((tool) => tool.name), ['generate_context', 'repo_map', 'find_relevant_files', 'impact_analysis']);

    const called = await sendAndWait(server, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'repo_map',
        arguments: { target: '.', task: 'validate MCP server', maxFiles: 50 },
      },
    });
    const repoMap = JSON.parse(called.result.content[0].text);
    assert.equal(repoMap.schemaVersion, 1);
    assert.ok(repoMap.stats.filesIndexed > 0);

    const relevant = await sendAndWait(server, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'find_relevant_files',
        arguments: { target: '.', task: 'validate MCP server', maxFiles: 50, limit: 3 },
      },
    });
    const relevantPayload = JSON.parse(relevant.result.content[0].text);
    assert.equal(relevantPayload.files.length, 3);
    assert.ok(relevantPayload.files[0].path);

    const impact = await sendAndWait(server, {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'impact_analysis',
        arguments: { target: '.', file: 'src/mcp.js', task: 'change MCP tools', maxFiles: 100, limit: 5 },
      },
    });
    const impactPayload = JSON.parse(impact.result.content[0].text);
    assert.equal(impactPayload.file.path, 'src/mcp.js');
    assert.ok(Array.isArray(impactPayload.impact.outgoing));
  } finally {
    server.child.kill();
    await once(server.child, 'exit');
  }
});

# MCP server

RepoLens includes a minimal Model Context Protocol-style stdio server for coding agents that can call tools.

## Run

```bash
node src/mcp.js
```

When installed as a package, use:

```bash
repolens-mcp
```

For client configuration snippets, see [`agent-setup.md`](agent-setup.md).

## Tools

### `generate_context`

Generate Markdown and/or JSON context files for a local path or public GitHub repository URL.

Input:

```json
{
  "target": ".",
  "task": "add GitHub OAuth login",
  "agent": "codex",
  "out": ".repolens",
  "outputMode": "all",
  "maxFiles": 800
}
```

Returns a JSON summary containing the output directory, generated files, repository source, and indexed file count.

### `repo_map`

Return a machine-readable `repo-map.json` payload without writing Markdown files.

Input:

```json
{
  "target": ".",
  "task": "fix payment webhook retries",
  "agent": "codex",
  "maxFiles": 800
}
```

### `find_relevant_files`

Return a compact list of the most relevant files for a task.

Input:

```json
{
  "target": ".",
  "task": "add GitHub OAuth login",
  "agent": "codex",
  "maxFiles": 800,
  "limit": 12
}
```

This is the best tool for an agent's first question: "where should I start?"

### `impact_analysis`

Analyze what a file depends on, what depends on it, nearby tests, and suggested related files.

Input:

```json
{
  "target": ".",
  "file": "src/mcp.js",
  "task": "change MCP tools",
  "agent": "codex",
  "maxFiles": 800,
  "limit": 20
}
```

This is the best tool for an agent's question: "if I edit this file, what else should I inspect?"

### `test_strategy`

Suggest verification commands, nearby tests, files to inspect, coverage gaps, and risk level for a task or target file.

Input:

```json
{
  "target": ".",
  "task": "change MCP tools",
  "file": "src/mcp.js",
  "agent": "codex",
  "maxFiles": 800,
  "limit": 12
}
```

This is the best tool for an agent's question: "what should I run or add to verify this change?"

## Example JSON-RPC lines

```jsonl
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"repo_map","arguments":{"target":".","task":"understand this repo"}}}
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"find_relevant_files","arguments":{"target":".","task":"add GitHub OAuth login","limit":5}}}
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"impact_analysis","arguments":{"target":".","file":"src/mcp.js","task":"change MCP tools"}}}
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"test_strategy","arguments":{"target":".","file":"src/mcp.js","task":"change MCP tools"}}}
```

## Status

This is a dependency-free minimal stdio implementation intended to validate the RepoLens tool interface. Future releases can add richer MCP compatibility, resource support, and agent-specific setup snippets.

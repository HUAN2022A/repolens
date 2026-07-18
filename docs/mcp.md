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

## Example JSON-RPC lines

```jsonl
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"repo_map","arguments":{"target":".","task":"understand this repo"}}}
```

## Status

This is a dependency-free minimal stdio implementation intended to validate the RepoLens tool interface. Future releases can add richer MCP compatibility, resource support, and agent-specific setup snippets.

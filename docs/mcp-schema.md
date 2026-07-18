# MCP schema

RepoLens exposes a minimal stdio JSON-RPC interface for coding agents. The server is intentionally small and dependency-free, but the tool contracts below are treated as the v1.0 public interface.

## Stability policy

For v1.x releases:

- existing tool names will remain available;
- existing input fields will remain backward-compatible;
- new optional fields may be added;
- output objects may gain fields, but existing top-level meanings should remain stable;
- breaking changes should wait for a major version bump.

## Shared input fields

Most tools accept these fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | string | `.` | Local repository path or public GitHub URL. |
| `task` | string | `""` | Natural-language task used for relevance ranking. |
| `agent` | string | `generic` | Prompt flavor: `generic`, `codex`, `claude-code`, or `cursor`. |
| `maxFiles` | integer | `800` | Maximum number of files to scan. |
| `limit` | integer | tool-specific | Maximum number of focused results to return. |

## Tool: `generate_context`

Generate Markdown and/or JSON context files.

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

Additional fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `out` | string | `.repolens` | Output directory. |
| `outputMode` | string | `all` | `all`, `json`, or `markdown`. |

Output shape:

```json
{
  "outDir": ".repolens",
  "files": ["overview.md", "architecture.md", "task-context.md", "agent-prompt.md", "repo-map.json"],
  "repository": "/path/to/repo",
  "filesIndexed": 123
}
```

Use this when an agent or workflow wants artifacts on disk.

## Tool: `repo_map`

Return the full machine-readable repository map without writing Markdown files.

Input:

```json
{
  "target": ".",
  "task": "fix payment webhook retries",
  "agent": "codex",
  "maxFiles": 800
}
```

Output shape:

```json
{
  "repository": {},
  "task": "fix payment webhook retries",
  "agent": "codex",
  "stack": [],
  "files": [],
  "relevantFiles": [],
  "dependencyGraph": {},
  "stats": {}
}
```

Use this when another tool wants the raw context model.

## Tool: `find_relevant_files`

Return a compact first-stop list for a task.

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

Output shape:

```json
{
  "repository": {},
  "task": "add GitHub OAuth login",
  "files": [
    {
      "path": "src/auth.ts",
      "score": 42,
      "reasons": ["filename mentions auth", "content mentions github"]
    }
  ]
}
```

Use this before editing to decide where to look first.

## Tool: `impact_analysis`

Analyze a repository-relative file.

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

Required fields:

| Field | Type | Description |
| --- | --- | --- |
| `file` | string | Repository-relative file path to analyze. |

Output shape:

```json
{
  "file": "src/mcp.js",
  "risk": "medium",
  "outgoingDependencies": [],
  "incomingDependents": [],
  "nearbyTests": [],
  "suggestedFiles": [],
  "guidance": []
}
```

Use this after choosing a file and before changing it.

## Tool: `test_strategy`

Suggest verification commands and related test work.

Input:

```json
{
  "target": ".",
  "task": "change MCP tools",
  "file": "src/mcp.js",
  "files": ["src/mcp.js", "test/mcp.test.js"],
  "agent": "codex",
  "maxFiles": 800,
  "limit": 12
}
```

File targeting fields:

| Field | Type | Description |
| --- | --- | --- |
| `file` | string | One repository-relative file. |
| `files` | string[] | Multiple repository-relative files. |

Output shape:

```json
{
  "task": "change MCP tools",
  "targetFiles": [],
  "verificationCommands": ["npm test"],
  "nearbyTests": [],
  "filesToInspect": [],
  "coverageGaps": [],
  "risk": "medium",
  "guidance": []
}
```

Use this before final validation or when deciding whether to add tests.

## JSON-RPC examples

```jsonl
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_relevant_files","arguments":{"target":".","task":"add login","limit":5}}}
```

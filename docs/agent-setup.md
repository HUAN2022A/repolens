# Agent setup examples

RepoLens exposes a stdio server command:

```bash
npm install -g @huan2022a/repolens
repolens-mcp
```

Use that command anywhere your coding agent or desktop client accepts a local MCP-style stdio server.

## Generic MCP server block

```json
{
  "mcpServers": {
    "repolens": {
      "command": "repolens-mcp"
    }
  }
}
```

If you are developing from source instead of an installed package:

```json
{
  "mcpServers": {
    "repolens": {
      "command": "node",
      "args": ["/absolute/path/to/repolens/src/mcp.js"]
    }
  }
}
```

## Claude Desktop-style config

Many MCP clients use a Claude Desktop-style JSON shape:

```json
{
  "mcpServers": {
    "repolens": {
      "command": "repolens-mcp"
    }
  }
}
```

For Windows source checkouts, use escaped backslashes or forward slashes:

```json
{
  "mcpServers": {
    "repolens": {
      "command": "node",
      "args": ["C:/Users/you/projects/repolens/src/mcp.js"]
    }
  }
}
```

## Cursor / editor agents

If your editor supports MCP-style stdio servers, add a server named `repolens` with:

- command: `repolens-mcp`
- transport: `stdio`
- working directory: your repository root, when the client supports it

Then ask the agent to call:

- `find_relevant_files` before editing;
- `repo_map` when it needs structured context;
- `generate_context` when you want Markdown files written to disk.

## Suggested agent workflow

1. Call `find_relevant_files` with the user's task.
2. Read the top files returned by RepoLens.
3. Call `repo_map` if the task needs broader repository structure.
4. Implement the change.
5. Run tests suggested by the generated context.

## Troubleshooting

- If `repolens-mcp` is not found, install the package globally or use the source checkout command.
- If a GitHub URL fails over HTTPS on Windows, RepoLens tries SSH fallback; make sure your GitHub SSH auth works.
- If a client cannot set the working directory, pass an absolute `target` argument when calling tools.

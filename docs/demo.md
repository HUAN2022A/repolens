# Demo: task-aware context for an AI coding agent

This demo shows the shape of a RepoLens context pack.

## Command

```bash
node src/cli.js . --task "add GitHub OAuth login" --for codex --out examples/basic-context
```

After npm installation, the equivalent command is:

```bash
repolens . --task "add GitHub OAuth login" --for codex --out examples/basic-context
```

## Generated files

```txt
examples/basic-context/
  overview.md
  architecture.md
  task-context.md
  agent-prompt.md
  repo-map.json
```

## How to use it with an agent

1. Open [`examples/basic-context/agent-prompt.md`](../examples/basic-context/agent-prompt.md).
2. Paste it into Codex, Claude Code, Cursor, or another coding agent.
3. Add [`examples/basic-context/task-context.md`](../examples/basic-context/task-context.md) when the agent needs file previews and relevance reasons.
4. Use [`examples/basic-context/repo-map.json`](../examples/basic-context/repo-map.json) for tool integrations.

## What to look for

- `task-context.md` lists relevant files and explains why they were selected.
- `architecture.md` gives a compact layer map and likely verification commands.
- `agent-prompt.md` gives the coding agent a clear starting context and expected final response format.
- `repo-map.json` exposes the same context in a machine-readable format.

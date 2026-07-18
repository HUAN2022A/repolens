# RepoLens

[![CI](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml/badge.svg)](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml)

RepoLens generates compact, agent-ready context packs for AI coding agents.

Instead of dumping an entire repository into a model, RepoLens scans the project, finds high-signal files, infers the repository shape, and writes Markdown context that can be pasted into Codex, Claude Code, Cursor, Gemini CLI, OpenCode, or another coding agent.

## Install / Run

This MVP has no runtime dependencies and requires Node.js 18+.

```bash
node src/cli.js .
node src/cli.js https://github.com/user/repo
node src/cli.js . --task "add GitHub OAuth login" --for codex
node src/cli.js . --json-only
```

If installed as a package, the command is:

```bash
repolens . --task "fix payment webhook retries"
```

## Output

RepoLens writes a `.repolens/` folder by default:

~~~txt
.repolens/
  overview.md
  architecture.md
  task-context.md
  agent-prompt.md
  repo-map.json
~~~

## What it does today

- Scans a local repository while ignoring dependency/build/cache directories.
- Scans a local repository or a public GitHub repository URL.
- Loads common `.gitignore` patterns to avoid project-specific noise.
- Detects common stacks from manifests such as `package.json`, `pyproject.toml`, `go.mod`, and `Cargo.toml`.
- Classifies files into config, entrypoint, business logic, UI, tests, docs, and source.
- Generates a general repo overview and a task-focused context pack.
- Ranks task-relevant files with path, filename, content, role, and domain-hint signals.
- Produces an agent prompt tuned for generic agents, Codex, Claude Code, or Cursor.
- Writes `repo-map.json` for tools, MCP servers, and future integrations.
- Supports all-output, JSON-only, and Markdown-only generation modes.

## What comes next

- AST/tree-sitter symbols and dependency graph.
- MCP server so agents can call `find_relevant_files(task)` directly.
- GitHub Action for issue/PR context comments.

## Example

~~~bash
node src/cli.js ./my-app --task "add team invitation emails" --for codex
~~~

Then paste `.repolens/agent-prompt.md` and `.repolens/task-context.md` into your AI coding agent before implementation.

## Smoke test

```bash
npm run smoke
```

The smoke test runs RepoLens against this repository and verifies that all Markdown outputs plus `repo-map.json` are generated and parseable.

## License

MIT

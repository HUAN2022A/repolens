# RepoLens

[![CI](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml/badge.svg)](https://github.com/HUAN2022A/repolens/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/HUAN2022A/repolens)](https://github.com/HUAN2022A/repolens/releases)
[![npm](https://img.shields.io/npm/v/@huan2022a/repolens?label=npm)](https://www.npmjs.com/package/@huan2022a/repolens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Give your AI coding agent the repo context it actually needs.

RepoLens turns a local project or public GitHub repository into a compact, task-aware context pack for Codex, Claude Code, Cursor, Gemini CLI, OpenCode, and other coding agents. Instead of dumping an entire codebase into an LLM, RepoLens finds high-signal files, explains why they matter, and writes agent-ready Markdown plus a machine-readable `repo-map.json`.

## Why RepoLens?

AI coding agents are powerful, but they still waste time and tokens reading the wrong files. RepoLens acts like a lightweight navigation layer before the agent starts editing:

- find the files that matter for a task;
- summarize the repository shape;
- expose project conventions and likely verification commands;
- produce a prompt you can paste directly into an agent;
- emit JSON for future MCP, GitHub Action, and tool integrations.
- expose the same context through a minimal stdio MCP server.

## Quickstart

RepoLens has no runtime dependencies and requires Node.js 18+.

Install from npm after the package is published:

```bash
npm install -g @huan2022a/repolens
repolens . --task "add GitHub OAuth login" --for codex
```

Or run from source:

```bash
git clone https://github.com/HUAN2022A/repolens.git
cd repolens
npm test
npm run smoke
node src/cli.js . --task "add GitHub OAuth login" --for codex
```

Analyze a public GitHub repository:

```bash
node src/cli.js https://github.com/octocat/Hello-World --task "understand this repo"
```

The package exposes two commands:

```bash
repolens . --task "fix payment webhook retries" --for codex
repolens-mcp
```

## Output

RepoLens writes a `.repolens/` directory by default:

~~~txt
.repolens/
  overview.md        # repo shape, stack, high-signal files
  architecture.md    # inferred layers and verification commands
  task-context.md    # task-relevant files with previews and reasons
  agent-prompt.md    # paste-ready prompt for your coding agent
  repo-map.json      # machine-readable map for integrations
~~~

Use output modes when integrating with tools:

```bash
node src/cli.js . --json-only
node src/cli.js . --markdown-only
```

## MCP server

RepoLens also ships a minimal stdio server:

```bash
node src/mcp.js
# or, when installed:
repolens-mcp
```

It exposes `generate_context`, `repo_map`, and `find_relevant_files` tools for coding agents. See [`docs/mcp.md`](docs/mcp.md), and setup snippets in [`docs/agent-setup.md`](docs/agent-setup.md).

## Example task context

For a task like `add GitHub OAuth login`, RepoLens ranks relevant files and explains why they were selected:

```md
## Most relevant files

- `README.md` — Documentation; content mentions "github"; content mentions "oauth"
- `src/relevance.js` — General source files; content mentions "oauth"; content mentions "login"
- `src/cli.js` — General source files; content mentions "github"
```

See [`examples/basic-context`](examples/basic-context) for a complete generated context pack from this repository.

For a walkthrough, see [`docs/demo.md`](docs/demo.md). For reproducible baseline notes, see [`docs/benchmark.md`](docs/benchmark.md).

## Features

- Local repository scanning with dependency/build/cache ignores.
- Public GitHub URL scanning through shallow clone, with SSH fallback.
- Common `.gitignore` pattern support.
- Stack detection from manifests such as `package.json`, `pyproject.toml`, `go.mod`, and `Cargo.toml`.
- File classification into config, entrypoint, business logic, UI, tests, docs, and source.
- Task-aware relevance ranking with path, filename, content, role, and domain-hint signals.
- Dependency-free symbol and import extraction for common JS/TS, Python, Go, Rust, and Java patterns.
- Internal dependency edge resolution for relative imports, including index-file candidates.
- `tsconfig.json` / `jsconfig.json` path alias resolution plus common `@/* -> src/*` convention.
- Agent-flavored prompts for generic agents, Codex, Claude Code, and Cursor.
- All-output, JSON-only, and Markdown-only generation modes.
- Node test suite, smoke test, GitHub Actions CI, release notes, and example output.

## Roadmap

- AST/tree-sitter symbols and dependency graph.
- Richer MCP compatibility and setup snippets for specific agents.
- GitHub Action for issue/PR context comments.
- npm package publishing.

## Development

```bash
npm test
npm run smoke
npm run pack:test
npm pack --dry-run
```

The unit tests cover CLI validation, ignore matching, relevance scoring, and output modes. The smoke test runs RepoLens against this repository and verifies that all Markdown outputs plus `repo-map.json` are generated and parseable. The pack test installs the generated npm tarball in a temporary project and verifies the `repolens` bin.

## Contributing and security

- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local development and project principles.
- See [`SECURITY.md`](SECURITY.md) for vulnerability reporting.
- See [`CHANGELOG.md`](CHANGELOG.md) for release history.
- See [`docs/releases/v0.1.0.md`](docs/releases/v0.1.0.md) for the first release notes.
- See [`docs/releases/v0.2.0.md`](docs/releases/v0.2.0.md) for the MCP server release notes.
- See [`docs/releases/v0.3.0.md`](docs/releases/v0.3.0.md) for the agent setup release notes.
- See [`docs/releases/v0.4.0.md`](docs/releases/v0.4.0.md) for the symbol/import release notes.
- See [`docs/releases/v0.5.0.md`](docs/releases/v0.5.0.md) for the latest release notes.
- See [`docs/releases/v0.6.0.md`](docs/releases/v0.6.0.md) for npm publish-ready release notes.

## License

MIT

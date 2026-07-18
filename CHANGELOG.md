# Changelog

All notable changes to RepoLens will be documented here.

## [0.2.0] - 2026-07-19

### Added

- Minimal dependency-free stdio MCP server exposed as `repolens-mcp`.
- MCP tools: `generate_context` and `repo_map`.
- Shared context generation layer used by both CLI and MCP server.
- MCP server test coverage and documentation.
- Improved README positioning, demo docs, benchmark notes, and packed CLI verification.

## [0.1.0] - 2026-07-18

### Added

- Local repository scanning with common dependency/build/cache ignores.
- Public GitHub URL scanning through shallow clone, with SSH fallback.
- `.gitignore` pattern support for common file and directory rules.
- Task-aware relevance ranking with reasons in `repo-map.json`.
- Markdown context outputs: `overview.md`, `architecture.md`, `task-context.md`, and `agent-prompt.md`.
- Machine-readable `repo-map.json` output.
- Output modes: all files, `--json-only`, and `--markdown-only`.
- Agent flavors for generic agents, Codex, Claude Code, and Cursor.
- Node test suite, smoke test, GitHub Actions CI, npm package metadata, and example output.

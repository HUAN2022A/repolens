# Changelog

All notable changes to RepoLens will be documented here.

## [0.6.0] - 2026-07-19

### Changed

- Renamed npm package metadata to the available scoped package `@huan2022a/repolens` while preserving the `repolens` and `repolens-mcp` command names.
- Updated README and agent setup docs with npm installation guidance.

### Notes

- The unscoped `repolens` npm package name is already occupied on npm, so the project is prepared for scoped publishing.

## [0.5.0] - 2026-07-19

### Added

- Internal dependency edge resolution for relative imports.
- Dependency graph output in `repo-map.json`, including edges, unresolved relative imports, and incoming-edge hotspots.
- Dependency graph stats in smoke validation and generated architecture docs.

### Changed

- Refreshed example context output with dependency graph data.

## [0.4.0] - 2026-07-19

### Added

- Dependency-free symbol and import extraction for common JS/TS, Python, Go, Rust, and Java patterns.
- Symbol and import stats in `repo-map.json`.
- Per-file `symbols` and `imports` arrays in machine-readable output.
- Symbol/import hotspots in generated architecture docs and task context.

### Changed

- Refreshed example context output to include symbols and imports.

## [0.3.0] - 2026-07-19

### Added

- `find_relevant_files` MCP tool for lightweight task-to-file routing.
- MCP agent setup examples for generic clients, Claude Desktop-style configs, and editor agents.
- Expanded MCP documentation with tool guidance and JSON-RPC examples.

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

# Roadmap

RepoLens is moving toward a simple thesis: every AI coding agent should begin with a compact, inspectable repository map instead of guessing which files matter.

## v1.0 foundation

The v1.0 line focuses on a dependable local-first context engine:

- CLI context generation for local repositories and public GitHub URLs.
- Markdown outputs for human review and agent prompting.
- `repo-map.json` for integrations.
- Minimal stdio MCP server.
- Task-aware file relevance ranking.
- Lightweight symbol and import extraction.
- Internal dependency graph for relative and alias imports.
- Impact analysis for target files.
- Test strategy suggestions for tasks and changed files.
- CI, smoke tests, pack tests, release notes, and community docs.

## Near-term improvements

- Add MCP resources for generated context artifacts.
- Improve package/workspace dependency resolution beyond relative and alias imports.
- Add more repository archetype detection, especially monorepos and service/frontend splits.
- Expand examples for real-world backend, frontend, and full-stack projects.
- Add benchmark fixtures for scan speed, ranking quality, and output stability.

## Future directions

- Optional parser-backed analysis with tree-sitter or language-server adapters.
- Incremental repository indexing and cache reuse for large codebases.
- GitHub Action that comments context packs on issues and pull requests.
- Agent-specific profiles for Codex, Claude Code, Cursor, Gemini CLI, and OpenCode.
- Interactive context refinement: ask RepoLens for the next file, impact radius, or verification plan as the task evolves.
- Team conventions extraction from tests, docs, scripts, and prior project structure.

## Non-goals for now

- RepoLens is not trying to be a full static-analysis platform.
- RepoLens is not trying to replace search, ripgrep, language servers, or human review.
- RepoLens should not require heavyweight services to be useful.

The sweet spot is the first five minutes of an AI coding task: orient quickly, pick the right files, understand likely impact, and verify with confidence.

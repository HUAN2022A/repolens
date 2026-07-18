# Contributing to RepoLens

Thanks for helping make RepoLens better. The project goal is simple: give AI coding agents the smallest useful codebase context for a task.

## Local setup

RepoLens currently has no runtime dependencies. You need Node.js 18+.

```bash
npm test
npm run smoke
node src/cli.js . --task "improve repo context" --for codex
```

## Development workflow

1. Keep changes small and focused.
2. Add or update tests for behavior changes.
3. Run `npm test` and `npm run smoke` before opening a PR.
4. If you change generated output, update `examples/basic-context` when it helps reviewers understand the change.

## Good first areas

- Better language and framework detection.
- More precise task relevance scoring.
- Additional output formats for coding agents.
- MCP server integration.
- GitHub Action integration for issues and PRs.

## Project principles

- Prefer compact context over huge context dumps.
- Preserve local-first behavior.
- Avoid mandatory paid services or API keys for core scanning.
- Keep the CLI useful even before LLM integrations are added.

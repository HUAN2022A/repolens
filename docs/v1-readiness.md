# v1.0 readiness audit

This document records the release-readiness state for RepoLens v1.0.

## Summary

RepoLens is ready for a GitHub v1.0 release as a local-first CLI and minimal MCP context engine. The only known external publishing blocker is npm authentication on the release machine.

## Checked capabilities

| Area | Status | Notes |
| --- | --- | --- |
| CLI context generation | Ready | Generates Markdown and JSON context packs for local paths and public GitHub URLs. |
| MCP server | Ready | Exposes `generate_context`, `repo_map`, `find_relevant_files`, `impact_analysis`, and `test_strategy`. |
| Repository scanning | Ready | Applies built-in dependency/build/cache ignores plus common `.gitignore` rules. |
| Relevance ranking | Ready | Produces task-aware file rankings with explainable reasons. |
| Symbol/import extraction | Ready | Uses dependency-free heuristics for common languages. |
| Dependency graph | Ready | Resolves internal relative imports and common JS/TS aliases. |
| Impact analysis | Ready | Reports outgoing dependencies, incoming dependents, nearby tests, related files, and risk. |
| Test strategy | Ready | Suggests verification commands, related tests, inspection targets, coverage gaps, and risk. |
| Documentation | Ready | README, MCP docs, architecture docs, schema docs, roadmap, examples, benchmark notes, release notes, and community docs are present. |
| CI | Ready | GitHub Actions has been green for the recent release commits. |
| Package metadata | Ready | Scoped package name is `@huan2022a/repolens`; CLI bins remain `repolens` and `repolens-mcp`. |
| npm publish | Blocked externally | `npm whoami` returns `ENEEDAUTH`; publishing requires `npm adduser` / browser login on the release machine. |

## Validation checklist

Before cutting v1.0.0, run:

```bash
npm test
npm run smoke
npm run pack:test
npm pack --dry-run
```

Expected state:

- unit tests pass;
- smoke test confirms all context-pack artifacts are generated and parseable;
- pack test installs the generated npm tarball in a temporary project and verifies the `repolens` binary;
- dry-run package contents include source, scripts, README, and license;
- GitHub Actions passes after the release commit is pushed.

## Known limitations accepted for v1.0

- Symbol and import extraction is heuristic rather than parser-backed.
- Internal dependency graph resolution focuses on relative imports and common aliases; external package graphing is future work.
- The MCP server is intentionally minimal and does not yet expose resources, prompts, or advanced transport options.
- Large monorepos may require future caching, workspace awareness, and incremental indexing.
- npm publication is not complete until the package owner authenticates the local npm session.

## Release criteria

RepoLens can be considered v1.0 complete when:

1. version metadata is updated to `1.0.0`;
2. `CHANGELOG.md` and `docs/releases/v1.0.0.md` describe the release;
3. the full validation checklist passes locally;
4. the release commit is pushed to `main`;
5. GitHub Actions passes on the release commit;
6. tag `v1.0.0` and GitHub Release `v1.0.0` exist;
7. npm publish is either completed or explicitly documented as blocked by local npm authentication.

# Benchmark notes

RepoLens is pre-1.0, so this document focuses on reproducible baseline measurements rather than marketing claims.

## Baseline: RepoLens repository

Generated from this repository with:

```bash
node src/cli.js . --task "add GitHub OAuth login" --for codex --out examples/basic-context
```

Observed output from `examples/basic-context/repo-map.json`:

| Metric | Value |
|---|---:|
| Files indexed | 14 |
| Task-relevant files | 14 |
| Output files | 5 |
| Docs files | 1 |
| Config files | 1 |
| Source files | 7 |
| Test files | 5 |
| Symbols detected | See `repo-map.json` |
| Imports detected | See `repo-map.json` |
| Internal dependency edges | See `repo-map.json` |
| Alias dependency edges | See `repo-map.json` |
| Unresolved relative imports | See `repo-map.json` |

## Reproduce locally

```bash
npm test
npm run smoke
node src/cli.js . --task "add GitHub OAuth login" --for codex --out .repolens-benchmark
node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('.repolens-benchmark/repo-map.json','utf8')); console.log(m.stats, m.relevantFiles.length)"
```

## What future benchmarks should measure

- How many files an agent reads with and without RepoLens.
- Context size reduction versus full-repository dumps.
- Whether the generated task context improves first-pass implementation success.
- Relevance quality across large TypeScript, Python, Go, and Rust repositories.

## Current limitations

- The current scanner uses heuristics rather than AST-level symbol graphs.
- Symbol and import extraction is best-effort and intentionally dependency-free.
- Dependency edges resolve relative imports plus common `tsconfig.json` / `jsconfig.json` path aliases and the `@/* -> src/*` convention.
- Package-level dependency resolution remains future work.
- File relevance is based on path, filename, role, content mentions, and domain hints.
- Token savings are not yet benchmarked against Repomix, full dumps, or agent-native search.

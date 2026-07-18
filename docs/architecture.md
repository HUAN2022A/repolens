# Architecture

RepoLens is a small repository context engine for AI coding agents. Its job is not to replace a full language server or static analyzer; it builds a compact, explainable map of a codebase quickly enough to run before an agent starts work.

## Design goals

- Keep the runtime dependency-free so it is easy to install, pack, audit, and run in constrained agent environments.
- Prefer useful heuristics over heavyweight indexing for the first pass through a repository.
- Produce both human-readable Markdown and machine-readable JSON from the same context model.
- Expose the same engine through CLI and MCP entrypoints.
- Make every ranking or recommendation traceable with explicit reasons.

## Runtime layers

```text
CLI / MCP entrypoints
  -> context builder
    -> source resolver
    -> scanner and ignore matcher
    -> lightweight analyzer
    -> dependency graph builder
    -> relevance ranker
    -> impact and test-strategy helpers
    -> Markdown / JSON generators
```

### CLI and MCP entrypoints

- `src/cli.js` parses command-line options, invokes the shared context builder, and writes output files.
- `src/mcp.js` exposes the same capabilities as stdio JSON-RPC tools for coding agents.

Both entrypoints should stay thin. Product behavior belongs in shared modules so tests can exercise it without shelling out.

### Context builder

`src/context.js` coordinates the core flow: resolve the target, scan files, analyze symbols and imports, build dependency data, rank task-relevant files, and generate the final output pack.

This layer is the stable seam for future integrations such as a GitHub Action or richer MCP resources.

### Source resolver

`src/source.js` accepts either a local path or a public GitHub URL. GitHub repositories are shallow-cloned into a temporary directory so the rest of the engine can treat every target as a local repository.

### Scanner and ignore matcher

`src/scanner.js` walks the repository and classifies files. `src/gitignore.js` implements common `.gitignore` matching behavior plus built-in skips for dependency, build, cache, and VCS directories.

The scanner intentionally favors predictable behavior over perfect Git parity. RepoLens should avoid surprising agents with huge generated folders or dependency trees.

### Lightweight analyzer

`src/analyzer.js` extracts symbols and imports with dependency-free patterns for common languages, including JavaScript, TypeScript, Python, Go, Rust, Java, and Kotlin.

This is the current analysis boundary. It is fast and portable, but it is not a full parser. Future versions can optionally add tree-sitter or language-server adapters while preserving the existing JSON contract.

### Dependency graph builder

`src/graph.js` resolves internal dependency edges from relative imports and supported path aliases. It recognizes index-file candidates and common JavaScript/TypeScript alias forms such as `compilerOptions.paths` and `@/* -> src/*`.

The graph powers architecture summaries, impact analysis, and test strategy suggestions.

### Relevance ranker

`src/relevance.js` scores files against a task using path, filename, content snippets, role classification, symbols, imports, and domain hints. The output includes reasons so agents can explain why a file was selected.

### Impact and test strategy helpers

- `src/impact.js` answers: “If I edit this file, what else should I inspect?”
- `src/test-strategy.js` answers: “What should I run or add to verify this task?”

These helpers consume `repo-map.json` data. They do not require a second repository scan.

### Generators

`src/generator.js` writes the user-facing context pack: `overview.md`, `architecture.md`, `task-context.md`, `agent-prompt.md`, and `repo-map.json`.

The Markdown files are optimized for humans and coding-agent prompts. The JSON file is optimized for integrations.

## Data contract

The central data artifact is `repo-map.json`. It includes repository metadata, detected stack, file records, relevant files, dependency graph data, and summary statistics.

MCP tools should return either this artifact or focused views derived from it. That keeps the CLI and MCP behavior aligned.

## Current limitations

- Symbol and import extraction is heuristic, not parser-backed.
- Package-name dependency resolution is intentionally limited; internal relative and alias imports are the current focus.
- The MCP server is a minimal stdio implementation and does not yet expose resources or prompts.
- Large monorepos may need future incremental scanning, caching, and workspace-package awareness.

## Extension points

Good next areas for contribution:

- parser-backed analyzers behind the existing analyzer interface;
- richer package and workspace resolution in the graph builder;
- MCP resources for generated context files;
- GitHub Action comments that attach context packs to issues and pull requests;
- benchmark suites for large repositories and multi-language projects.

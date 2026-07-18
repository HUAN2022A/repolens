# GitHub Action

RepoLens can run inside GitHub Actions to generate an agent-ready context pack during CI, issue triage, or pull request workflows.

## Basic workflow

```yaml
name: RepoLens context

on:
  workflow_dispatch:
    inputs:
      task:
        description: Task to focus RepoLens on
        required: false
        default: understand this repository

jobs:
  context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: HUAN2022A/repolens@v1.0.0
        with:
          task: ${{ inputs.task }}
          agent: codex
```

By default, the action writes `.repolens/` and uploads it as an artifact named `repolens-context`.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `target` | `.` | Local repository path or public GitHub URL to analyze. |
| `task` | `""` | Task description used to focus relevance ranking. |
| `agent` | `generic` | Agent flavor: `generic`, `codex`, `claude-code`, or `cursor`. |
| `out` | `.repolens` | Output directory for the context pack. |
| `output-mode` | `all` | `all`, `json`, or `markdown`. |
| `max-files` | `800` | Maximum number of files to inspect. |
| `upload-artifact` | `true` | Upload the generated context pack as a workflow artifact. |
| `artifact-name` | `repolens-context` | Name for the uploaded artifact. |

## Outputs

| Output | Description |
| --- | --- |
| `output-dir` | Absolute path to the generated context pack directory. |
| `files` | Comma-separated list of generated context pack files. |
| `files-indexed` | Number of repository files indexed by RepoLens. |

## Pull request example

```yaml
name: RepoLens PR context

on:
  pull_request:

jobs:
  context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - id: repolens
        uses: HUAN2022A/repolens@v1.0.0
        with:
          task: review this pull request and identify likely impact
          agent: codex
          output-mode: all

      - run: echo "Indexed ${{ steps.repolens.outputs.files-indexed }} files"
```

## JSON-only context

Use `output-mode: json` when another workflow step only needs `repo-map.json`.

```yaml
- uses: HUAN2022A/repolens@v1.0.0
  with:
    task: route this issue to relevant files
    output-mode: json
```

## Notes

- The action expects Node.js to be available on the runner. GitHub-hosted runners include Node.js by default.
- For local repository analysis, run `actions/checkout` first.
- For public GitHub URL analysis, `target` can point directly at the repository URL.

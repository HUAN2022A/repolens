# Security Policy

## Supported versions

RepoLens is pre-1.0. Security fixes will target the latest published version and the `main` branch.

## Reporting a vulnerability

Please do not open public issues for security vulnerabilities.

Report security concerns through GitHub private vulnerability reporting if enabled, or contact the repository owner directly from the GitHub profile.

Include:

- A clear description of the issue.
- Steps to reproduce.
- Potential impact.
- Any suggested fix or mitigation.

## Security model

RepoLens scans local files and can shallow-clone public GitHub repositories when given a GitHub URL. It does not require API keys for core functionality and should not upload repository contents to external services.

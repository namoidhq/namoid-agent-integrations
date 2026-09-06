# Contributing to NamoID agent integrations

Thanks for helping improve NamoID's developer experience across AI coding
agents. This repository is the canonical source for Customer Identity skills,
agent adapters, and versioned integration artifacts in the
[`namoidhq`](https://github.com/namoidhq) organization.

## Filing issues

Search existing issues before opening a bug report or feature request. Include
the affected agent and version, operating system, expected behavior, actual
behavior, and the smallest reproducible example. Never include credentials,
access or refresh tokens, one-time codes, private keys, customer data, or
environment-variable values.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Submitting a pull request

1. Fork the repository and branch from `main`.
2. Keep the change focused on one concern.
3. Update the canonical skill before updating distribution wrappers.
4. Add or update adapter and manifest tests for behavior changes.
5. Document any permission, scope, endpoint, or compatibility change.
6. Run the required checks and open a pull request linked to its issue.

```bash
npm install --ignore-scripts
npm test
npm run build
```

Do not add credentials to adapters or make the CLI responsible for OAuth.
Changes must preserve the exact Customer Identity scopes and instance-bound
grant model. Discuss new production dependencies before adding them.

Release tags must match the manifest and package version. GitHub Actions builds
and attests immutable release artifacts; do not commit generated `dist/` files.

## Code of Conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Contributions are licensed under this repository's [MIT License](LICENSE).

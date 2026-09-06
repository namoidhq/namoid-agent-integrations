# NamoID Agent Integrations

[![Validation](https://github.com/namoidhq/namoid-agent-integrations/actions/workflows/validate.yml/badge.svg)](https://github.com/namoidhq/namoid-agent-integrations/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Canonical, versioned Customer Identity skills and agent adapters for NamoID.

This repository contains no credentials. AI hosts authenticate directly with
`https://mcp.namoid.in` using OAuth Authorization Code with PKCE. The NamoID
CLI only installs project-local skills and safe MCP configuration.

## Supported hosts

| Host | Skills | MCP configuration |
| --- | --- | --- |
| OpenAI Codex | `.agents/skills` | Native MCP OAuth |
| Claude Code | `.agents/skills` | Native MCP OAuth |
| Cursor | Portable root Agent Plugin or `.agents/skills` | Root `mcp.json` or `.cursor/mcp.json` |
| Gemini CLI | Root Gemini extension or `.agents/skills` | Root `gemini-extension.json` or `.gemini/settings.json` |
| Google Antigravity | `.agents/skills` | Native settings; `.agents/mcp_config.json` is the import template |
| GitHub Copilot CLI | `.agents/skills` | `copilot mcp` |
| VS Code Copilot | `.agents/skills` | `.vscode/mcp.json` |
| Copilot cloud/code review | `.agents/skills` | Skills only |
| Other agents | `.agents/skills` | Manual host-native setup |

The MCP connection requests only:

- `customer-identity:read`
- `customer-identity:configure`

NamoID binds the resulting grant to the exact Instance selected during hosted
consent. Live access always requires explicit selection.

## Development

```sh
npm test
npm run build
```

`npm run build` creates deterministic release artifacts in `dist/`. Tags named
`v*` publish those files with SHA-256 checksums and GitHub build provenance.

The repository root is also a conformant Agent Plugin, so compatible hosts
(including Cursor) discover `plugin.json`, `skills/`, and `mcp.json` directly.
Gemini CLI can install the repository as an extension using the root
`gemini-extension.json`. While this repository is private, installation and
release downloads require GitHub access; the NamoID CLI safely uses its bundled
verified integration release when unauthenticated downloads are unavailable.

Antigravity currently reads MCP configuration from its native user settings
under `~/.gemini/config/mcp_config.json` (or the path shown by its MCP settings
panel), not from a project-local file. The `.agents/mcp_config.json` artifact is
a credential-free template for that native import. OAuth still belongs to
Antigravity and is completed from its MCP panel.

## Source of truth

The files under `skills/` are canonical. Marketplace-specific Codex and Claude
repositories import a tagged release of these skills and must not edit their
copies independently.

## Security and contributions

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing changes. Permission,
OAuth, MCP endpoint, manifest, checksum, and release changes require matching
tests and explicit review. Never submit credentials, tokens, one-time codes,
private keys, or customer data.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), not
through a public issue. Participation is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Links

- [NamoID](https://namoid.in)
- [Documentation](https://docs.namoid.in)
- [Issues](https://github.com/namoidhq/namoid-agent-integrations/issues)

## License

[MIT](LICENSE) © PolyMindsLabs Pvt. Ltd.

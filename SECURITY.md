# Security policy

NamoID is an identity platform, so security reports must be handled privately.

## Reporting a vulnerability

Email `security@namoid.in`. Do not open a public GitHub issue.

Please include the affected integration version and agent, reproduction steps,
impact, and an optional suggested fix. Remove all real credentials, tokens,
one-time codes, private keys, personal data, and customer data from reports and
logs. We aim to acknowledge reports within 48 hours and provide a triage
decision within five business days.

## Relevant findings

- OAuth scope, consent, target-binding, or revocation weaknesses
- Manifest, checksum, provenance, downgrade, or release-verification bypasses
- Unsafe file writes, path traversal, symlink handling, or command execution
- Agent configuration that exposes credentials or grants unintended MCP access
- Skill instructions that could cause destructive or unauthorized operations
- Dependency or supply-chain vulnerabilities that affect shipped artifacts

## Safe harbor

If you act in good faith, avoid service disruption and unnecessary data access,
and allow reasonable time for remediation before disclosure, NamoID will not
pursue legal action for your security research.

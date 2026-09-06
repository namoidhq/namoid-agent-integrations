# GitHub Copilot adapter

The NamoID CLI installs canonical skills in `.agents/skills` for Copilot CLI,
VS Code, JetBrains IDEs, coding agent, and code review.

For Copilot CLI, add the remote server through the native interface:

```sh
copilot mcp add --transport http namoid-customer-identity https://mcp.namoid.in
```

Then use `/mcp auth namoid-customer-identity` when Copilot requests OAuth.

The `.vscode/mcp.json` template provides the equivalent project configuration
for VS Code. Copilot coding agent and code review intentionally receive skills
only; autonomous cloud agents must not receive configuration access by default.

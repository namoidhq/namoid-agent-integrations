# Generic agent adapter

Copy the canonical `skills/` directories into the project's `.agents/skills/`
directory. If the host supports remote MCP over HTTP, add a server named
`namoid-customer-identity` with URL `https://mcp.namoid.in` and complete OAuth
inside the host. Do not put bearer tokens, refresh tokens, client secrets, or
custom authorization headers in project files.

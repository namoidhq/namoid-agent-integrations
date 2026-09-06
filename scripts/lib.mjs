import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
export const CANONICAL_REPOSITORY = "https://github.com/namoidhq/namoid-agent-integrations";
export const MCP_NAME = "namoid-customer-identity";
export const MCP_URL = "https://mcp.namoid.in";
export const ALLOWED_SCOPES = [
  "customer-identity:read",
  "customer-identity:configure",
];

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function collectFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Release sources must not contain symlinks: ${fullPath}`);
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath, base));
    } else if (entry.isFile()) {
      const info = await stat(fullPath);
      if (!info.size) throw new Error(`Release source is empty: ${fullPath}`);
      files.push({
        absolutePath: fullPath,
        relativePath: path.relative(base, fullPath).split(path.sep).join("/"),
      });
    }
  }
  return files;
}

export function validateManifest(manifest, packageJson) {
  if (manifest.schemaVersion !== 1) throw new Error("Unsupported manifest schemaVersion");
  if (manifest.version !== packageJson.version) throw new Error("Manifest and package versions differ");
  if (manifest.repository !== CANONICAL_REPOSITORY) throw new Error("Unexpected manifest repository");
  if (manifest.release?.tag !== `v${manifest.version}`) throw new Error("Release tag must match version");
  if (manifest.mcpServer?.name !== MCP_NAME) throw new Error("Unexpected MCP server name");
  if (manifest.mcpServer?.url !== MCP_URL) throw new Error("Unexpected MCP server URL");
  if (manifest.mcpServer?.oauth !== "authorization-code-pkce") throw new Error("MCP must use Authorization Code with PKCE");
  if (manifest.mcpServer?.targetBinding !== "instance") throw new Error("MCP grants must bind to Instances");
  if (JSON.stringify(manifest.mcpServer?.allowedScopes) !== JSON.stringify(ALLOWED_SCOPES)) {
    throw new Error("Unexpected MCP scopes");
  }
  if (manifest.agents?.copilot?.cloudMcp !== false) {
    throw new Error("Copilot cloud must remain skills-only");
  }
}

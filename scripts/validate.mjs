import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ALLOWED_SCOPES,
  MCP_NAME,
  MCP_URL,
  ROOT,
  collectFiles,
  readJson,
  validateManifest,
} from "./lib.mjs";

const manifest = await readJson(path.join(ROOT, "integrations-manifest.json"));
const packageJson = await readJson(path.join(ROOT, "package.json"));
validateManifest(manifest, packageJson);

if (packageJson.license !== "MIT" || packageJson.author !== "PolyMindsLabs Pvt. Ltd.") {
  throw new Error("Package licensing must match NamoID open-source standards");
}
const communityFiles = [
  "LICENSE",
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
];
for (const filename of communityFiles) {
  const source = await readFile(path.join(ROOT, filename), "utf8");
  if (!source.trim()) throw new Error(`${filename} must not be empty`);
}
const license = await readFile(path.join(ROOT, "LICENSE"), "utf8");
if (!license.startsWith("MIT License\n") || !license.includes("PolyMindsLabs Pvt. Ltd.")) {
  throw new Error("LICENSE must use NamoID's standard MIT license and copyright holder");
}
const securityPolicy = await readFile(path.join(ROOT, "SECURITY.md"), "utf8");
if (!securityPolicy.includes("security@namoid.in")) {
  throw new Error("SECURITY.md must provide NamoID's private reporting channel");
}

const skillFiles = await collectFiles(path.join(ROOT, "skills"));
for (const skillName of manifest.skills) {
  const skillPath = path.join(ROOT, "skills", skillName, "SKILL.md");
  const source = await readFile(skillPath, "utf8");
  if (!source.startsWith("---\n")) throw new Error(`${skillName} has no YAML frontmatter`);
  if (!source.includes(`\nname: ${skillName}\n`)) throw new Error(`${skillName} has the wrong frontmatter name`);
  if (!source.includes("\ndescription:")) throw new Error(`${skillName} has no description`);
}

const allSourceFiles = [
  ...skillFiles,
  ...await collectFiles(path.join(ROOT, "adapters")),
];
for (const file of allSourceFiles) {
  const source = await readFile(file.absolutePath, "utf8");
  if (/setup\.(identity|agent_auth)\.(read|write)/.test(source)) {
    throw new Error(`Legacy setup scope in ${file.relativePath}`);
  }
  if (/\b(Authorization|X-API-Key)\b\s*[":=]/i.test(source)) {
    throw new Error(`Static authorization header in ${file.relativePath}`);
  }
}

const cursor = await readJson(path.join(ROOT, "adapters/cursor/.cursor/mcp.json"));
const gemini = await readJson(path.join(ROOT, "adapters/gemini/.gemini/settings.json"));
const antigravity = await readJson(path.join(ROOT, "adapters/antigravity/.agents/mcp_config.json"));
const copilot = await readJson(path.join(ROOT, "adapters/copilot/.vscode/mcp.json"));

if (cursor.mcpServers?.[MCP_NAME]?.url !== MCP_URL) throw new Error("Invalid Cursor MCP adapter");
if (gemini.mcpServers?.[MCP_NAME]?.httpUrl !== MCP_URL) throw new Error("Invalid Gemini MCP adapter");
if (gemini.mcpServers?.[MCP_NAME]?.authProviderType !== "dynamic_discovery") {
  throw new Error("Gemini MCP must use host-owned OAuth discovery");
}
if (antigravity.mcpServers?.[MCP_NAME]?.serverUrl !== MCP_URL) throw new Error("Invalid Antigravity MCP adapter");
if (copilot.servers?.[MCP_NAME]?.url !== MCP_URL) throw new Error("Invalid Copilot MCP adapter");

const portablePlugin = await readJson(path.join(ROOT, "plugin.json"));
const portableMcp = await readJson(path.join(ROOT, "mcp.json"));
const geminiExtension = await readJson(path.join(ROOT, "gemini-extension.json"));
if (portablePlugin.$schema !== "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json") {
  throw new Error("Invalid portable Agent Plugin manifest");
}
if (portablePlugin.name !== MCP_NAME || portablePlugin.version !== manifest.version) {
  throw new Error("Portable Agent Plugin identity must match the release manifest");
}
if (portablePlugin.license !== packageJson.license) {
  throw new Error("Portable Agent Plugin license must match the repository license");
}
if (
  portableMcp.$schema !== "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json"
  || portableMcp.mcpServers?.[MCP_NAME]?.type !== "streamable-http"
  || portableMcp.mcpServers?.[MCP_NAME]?.url !== MCP_URL
) {
  throw new Error("Invalid portable Agent Plugin MCP configuration");
}
if (
  geminiExtension.name !== MCP_NAME
  || geminiExtension.version !== manifest.version
  || geminiExtension.mcpServers?.[MCP_NAME]?.httpUrl !== MCP_URL
  || geminiExtension.mcpServers?.[MCP_NAME]?.authProviderType !== "dynamic_discovery"
) {
  throw new Error("Invalid root Gemini extension");
}

if (ALLOWED_SCOPES.some((scope) => !JSON.stringify(manifest).includes(scope))) {
  throw new Error("Manifest is missing an allowed scope");
}

console.log(`Validated ${manifest.skills.length} skills and ${Object.keys(manifest.agents).length} agent adapters.`);

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { ROOT, sha256 } from "../scripts/lib.mjs";

test("release bundle is deterministic and internally checksummed", async () => {
  execFileSync(process.execPath, [path.join(ROOT, "scripts/build.mjs")]);
  const first = await readFile(path.join(ROOT, "dist/namoid-agent-integrations-0.1.0.bundle.json"));
  execFileSync(process.execPath, [path.join(ROOT, "scripts/build.mjs")]);
  const second = await readFile(path.join(ROOT, "dist/namoid-agent-integrations-0.1.0.bundle.json"));
  assert.equal(sha256(first), sha256(second));

  const bundle = JSON.parse(second);
  assert.equal(bundle.version, "0.1.0");
  assert.ok(bundle.files.length >= 10);
  for (const file of bundle.files) {
    assert.equal(sha256(Buffer.from(file.contentBase64, "base64")), file.sha256);
    assert.ok(!file.path.startsWith("/") && !file.path.includes(".."));
  }
});

test("manifest exposes only current customer identity scopes", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "integrations-manifest.json"), "utf8"));
  assert.deepEqual(manifest.mcpServer.allowedScopes, [
    "customer-identity:read",
    "customer-identity:configure",
  ]);
  assert.equal(manifest.mcpServer.targetBinding, "instance");
  assert.equal(manifest.agents.copilot.cloudMcp, false);
});

test("repository root is directly installable by portable and Gemini hosts", async () => {
  const plugin = JSON.parse(await readFile(path.join(ROOT, "plugin.json"), "utf8"));
  const mcp = JSON.parse(await readFile(path.join(ROOT, "mcp.json"), "utf8"));
  const gemini = JSON.parse(await readFile(path.join(ROOT, "gemini-extension.json"), "utf8"));

  assert.equal(plugin.name, "namoid-customer-identity");
  assert.equal(mcp.mcpServers[plugin.name].type, "streamable-http");
  assert.equal(mcp.mcpServers[plugin.name].url, "https://mcp.namoid.in");
  assert.equal(gemini.mcpServers[plugin.name].authProviderType, "dynamic_discovery");
});

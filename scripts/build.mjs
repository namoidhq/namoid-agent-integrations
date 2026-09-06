import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, collectFiles, readJson, sha256, validateManifest } from "./lib.mjs";

const manifest = await readJson(path.join(ROOT, "integrations-manifest.json"));
const packageJson = await readJson(path.join(ROOT, "package.json"));
validateManifest(manifest, packageJson);

const sources = [
  ...await collectFiles(path.join(ROOT, "skills"), ROOT),
  ...await collectFiles(path.join(ROOT, "adapters"), ROOT),
].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

const files = [];
for (const source of sources) {
  const content = await readFile(source.absolutePath);
  files.push({
    path: source.relativePath,
    sha256: sha256(content),
    contentBase64: content.toString("base64"),
  });
}

const bundle = Buffer.from(`${JSON.stringify({
  schemaVersion: 1,
  version: manifest.version,
  repository: manifest.repository,
  files,
}, null, 2)}\n`);
const releaseManifest = {
  ...manifest,
  release: {
    ...manifest.release,
    bundleSha256: sha256(bundle),
    fileCount: files.length,
  },
};
const releaseManifestBytes = Buffer.from(`${JSON.stringify(releaseManifest, null, 2)}\n`);

const dist = path.join(ROOT, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const bundleName = manifest.release.bundle;
await writeFile(path.join(dist, bundleName), bundle);
await writeFile(path.join(dist, "integrations-manifest.json"), releaseManifestBytes);
await writeFile(
  path.join(dist, "SHA256SUMS"),
  `${sha256(releaseManifestBytes)}  integrations-manifest.json\n${sha256(bundle)}  ${bundleName}\n`,
);

console.log(`Built ${bundleName} with ${files.length} files.`);

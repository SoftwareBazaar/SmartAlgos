/**
 * Merges loverble Nitro Vercel output for deploy.
 * Capital payments API lives in loverble server routes (same __server function).
 * Run after: cd loverble && npm run build
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loverbleOutput = path.join(root, "loverble", ".vercel", "output");
const rootOutput = path.join(root, ".vercel", "output");

if (!fs.existsSync(loverbleOutput)) {
  console.error("Missing loverble/.vercel/output — run: cd loverble && npm run build");
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (fs.existsSync(rootOutput)) {
  try {
    fs.rmSync(rootOutput, { recursive: true, force: true });
  } catch (err) {
    console.warn("[merge] Could not remove old output, merging over:", err.message);
  }
}
copyDir(loverbleOutput, rootOutput);

const configPath = path.join(rootOutput, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const routes = config.routes ?? [];
const filesystemIdx = routes.findIndex((r) => r.handle === "filesystem");
const insertAt = filesystemIdx >= 0 ? filesystemIdx : routes.length;
// Ensure /api hits Nitro __server (Capital Paystack middleware in start.ts).
if (!routes.some((r) => r.src === "/api/(.*)" && r.dest === "/__server")) {
  routes.splice(insertAt, 0, { src: "/api/(.*)", dest: "/__server" });
}
config.routes = routes;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

// TanStack Start ships a dev-only manifest stub that breaks client hydration on Vercel.
const serverFunc = path.join(rootOutput, "functions", "__server.func");
const prodManifest = fs
  .readdirSync(serverFunc)
  .find((f) => f.startsWith("_tanstack-start-manifest_v-") && f.endsWith(".mjs"));
if (prodManifest) {
  fs.copyFileSync(
    path.join(serverFunc, prodManifest),
    path.join(serverFunc, "_tanstack-start-manifest_v.mjs"),
  );
  console.log(`Patched production client manifest from ${prodManifest}`);
} else {
  console.warn("No hashed TanStack Start manifest found — client JS may not hydrate.");
}

console.log("Merged loverble frontend into .vercel/output (API via TanStack server routes)");

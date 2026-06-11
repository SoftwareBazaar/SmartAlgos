/**
 * Merges loverble Nitro Vercel output with the root Express API (api/index.js).
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
  fs.rmSync(rootOutput, { recursive: true, force: true });
}
copyDir(loverbleOutput, rootOutput);

const apiFuncDir = path.join(rootOutput, "functions", "api.func");
fs.mkdirSync(apiFuncDir, { recursive: true });

fs.writeFileSync(
  path.join(apiFuncDir, "index.js"),
  `require("dotenv").config();
process.env.VERCEL = "1";
module.exports = require("../../../api/index.js");
`,
);

fs.writeFileSync(
  path.join(apiFuncDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
      maxDuration: 60,
    },
    null,
    2,
  ),
);

const configPath = path.join(rootOutput, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const apiRoutes = [
  { src: "/api/(.*)", dest: "/api" },
  { src: "/health", dest: "/api" },
];

const routes = config.routes ?? [];
const filesystemIdx = routes.findIndex((r) => r.handle === "filesystem");
const insertAt = filesystemIdx >= 0 ? filesystemIdx : routes.length;
routes.splice(insertAt, 0, ...apiRoutes);
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

console.log("Merged loverble frontend + Express API into .vercel/output");

/**
 * Merges loverble Nitro Vercel output with a bundled Capital payments API.
 * Run after: cd loverble && npm run build
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

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

const apiFuncDir = path.join(rootOutput, "functions", "api.func");
fs.mkdirSync(apiFuncDir, { recursive: true });

// Bundle API + deps into one file — Vercel prebuilt output cannot resolve repo node_modules.
const entry = path.join(root, "api", "vercel-entry.js");
const outfile = path.join(apiFuncDir, "index.js");

console.log("[merge] Bundling Capital API with esbuild...");
execSync(
  `npx --yes esbuild "${entry}" --bundle --platform=node --target=node20 --outfile="${outfile}"`,
  { cwd: root, stdio: "inherit" },
);

const bundled = fs.readFileSync(outfile, "utf8");
fs.writeFileSync(outfile, `process.env.VERCEL = "1";\n${bundled}`);
console.log(`[merge] API bundle size: ${(fs.statSync(outfile).size / 1024 / 1024).toFixed(2)} MB`);

fs.writeFileSync(
  path.join(apiFuncDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
      maxDuration: 60,
      shouldAddHelpers: true,
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

console.log("Merged loverble frontend + bundled Capital API into .vercel/output");

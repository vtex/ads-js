import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Options } from "tsup";

type EsbuildPlugin = NonNullable<Options["esbuildPlugins"]>[number];

// Loads `import text from "./file.svg?raw"` as a string, the same way Vite
// does in dev and in tests.
const raw: EsbuildPlugin = {
  name: "raw",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace(/\?raw$/, "")),
      namespace: "raw",
    }));
    build.onLoad({ filter: /.*/, namespace: "raw" }, async (args) => ({
      contents: await readFile(args.path, "utf8"),
      loader: "text",
    }));
  },
};

// Custom elements must stay native ES classes (`class extends HTMLElement`),
// so no build goes below ES2018.
export default defineConfig([
  // npm: ESM (modern bundlers)
  {
    entry: ["src/index.ts", "src/react.ts"],
    format: ["esm"],
    target: "es2018",
    dts: true,
    sourcemap: true,
    outDir: "dist/esm",
    clean: false,
    bundle: true,
    splitting: false,
    esbuildPlugins: [raw],
  },
  // npm: CJS (require(), Jest, VTEX IO)
  {
    entry: ["src/index.ts", "src/react.ts"],
    format: ["cjs"],
    target: "es2018",
    // Emits index.d.cts: CJS consumers need CJS declarations, since this
    // package is "type": "module" and index.d.ts is read as ESM.
    dts: true,
    sourcemap: true,
    outDir: "dist/cjs",
    clean: false,
    bundle: true,
    splitting: false,
    esbuildPlugins: [raw],
  },
  // CDN: standalone script, registers the element on load
  {
    entry: { "vtex-ads-stories": "src/cdn.ts" },
    format: ["iife"],
    globalName: "VtexAdsStories",
    target: "es2018",
    dts: false,
    sourcemap: true,
    minify: true,
    outDir: "dist/cdn",
    clean: false,
    bundle: true,
    splitting: false,
    outExtension: () => ({ js: ".js" }),
    esbuildPlugins: [raw],
  },
]);

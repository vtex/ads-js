import { defineConfig } from "tsup";

// Custom elements must stay native ES classes (`class extends HTMLElement`),
// so no build goes below ES2018.
export default defineConfig([
  // npm: ESM (modern bundlers)
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "es2018",
    dts: true,
    sourcemap: true,
    outDir: "dist/esm",
    clean: false,
    bundle: true,
    splitting: false,
  },
  // npm: CJS (require(), Jest, VTEX IO)
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    target: "es2018",
    dts: false,
    sourcemap: true,
    outDir: "dist/cjs",
    clean: false,
    bundle: true,
    splitting: false,
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
  },
]);

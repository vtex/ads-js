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

// Lit is bundled into every build. It ships only ES modules (no require()),
// and its ES2021 syntax doesn't parse in bundlers that read `module` instead
// of `exports`, such as webpack 4 (VTEX IO). Bundled, it is lowered with the
// rest of the code.
const bundleLit = [/^lit(\/|$)/, /^@lit\//];

// The CDN script also bundles @vtex/ads-core.
const bundleAll = [...bundleLit, /^@vtex\/ads-core(\/|$)/];

// @vtex/ads-core imports fetch from cross-fetch, whose browser build carries
// an XHR fetch polyfill (~10 KB). Every browser that runs custom elements has
// fetch, so the CDN script uses the native one. It is read on each call, as
// with a global fetch.
const nativeFetch: EsbuildPlugin = {
  name: "native-fetch",
  setup(build) {
    build.onResolve({ filter: /^cross-fetch$/ }, () => ({
      path: "cross-fetch",
      namespace: "native-fetch",
    }));
    build.onLoad({ filter: /.*/, namespace: "native-fetch" }, () => ({
      contents:
        "export default (input, init) => globalThis.fetch(input, init);",
      loader: "js",
    }));
  },
};

// Custom elements must stay native ES classes (`class extends HTMLElement`),
// so no build goes below ES2018.
export default defineConfig([
  // npm: ESM (bundlers)
  {
    entry: ["src/index.ts", "src/react.ts"],
    format: ["esm"],
    target: "es2018",
    dts: true,
    sourcemap: true,
    outDir: "dist/esm",
    clean: false,
    bundle: true,
    noExternal: bundleLit,
    splitting: false,
    esbuildPlugins: [raw],
  },
  // npm: CJS (require(), Jest)
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
    noExternal: bundleLit,
    splitting: false,
    esbuildPlugins: [raw],
  },
  // CDN: standalone script, registers the element on load
  {
    entry: { "vtex-ads-stories": "src/cdn.ts" },
    format: ["iife"],
    globalName: "VtexAdsStories",
    // Browser builds of Lit: no Node shims for HTMLElement in the script.
    platform: "browser",
    target: "es2018",
    dts: false,
    sourcemap: true,
    minify: true,
    outDir: "dist/cdn",
    clean: false,
    bundle: true,
    noExternal: bundleAll,
    splitting: false,
    outExtension: () => ({ js: ".js" }),
    esbuildPlugins: [raw, nativeFetch],
  },
]);

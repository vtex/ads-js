import { defineConfig } from "tsup";

export default defineConfig([
  // Modern bundle: ESM + ES2018
  {
    entry: [
      "src/index.ts",
      "src/clients/adServer/index.ts",
      "src/clients/search/index.ts",
    ],
    format: ["esm"],
    target: "es2018",
    dts: true,
    sourcemap: true,
    outDir: "dist/esm",
    clean: false,
    bundle: true,
    splitting: false,
  },
  // Legacy bundle: CJS + ES5
  {
    entry: [
      "src/index.ts",
      "src/clients/adServer/index.ts",
      "src/clients/search/index.ts",
    ],
    format: ["cjs"],
    target: "es5",
    // reuse the same .d.ts from modern build
    dts: false,
    sourcemap: true,
    outDir: "dist/cjs",
    clean: true,
    bundle: true,
    splitting: false,
  },
]);

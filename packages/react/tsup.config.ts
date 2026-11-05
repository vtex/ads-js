import { defineConfig } from "tsup";

export default defineConfig([
  // ESM (modern)
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
    esbuildOptions(o) {
      o.jsx = "transform";
      o.jsxFactory = "React.createElement";
      o.jsxFragment = "React.Fragment";
    },
    outExtension: () => ({ js: ".js", dts: ".d.ts" }),
    external: ["react", "react-dom", "@vtex/ads-core"],
  },
  // CJS (legacy)
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    target: "es2018",
    dts: false,
    sourcemap: true,
    outDir: "dist/cjs",
    clean: true,
    bundle: true,
    splitting: false,
    esbuildOptions(o) {
      o.jsx = "transform";
      o.jsxFactory = "React.createElement";
      o.jsxFragment = "React.Fragment";
    },
    // ".cjs": the package is "type": "module", so Node would load a .js file
    // (even ".cjs.js") as an ES module and find no exports.
    outExtension: () => ({ js: ".cjs" }),
    external: ["react", "react-dom", "@vtex/ads-core"],
  },
]);

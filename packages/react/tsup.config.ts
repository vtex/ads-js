import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  outDir: "dist",
  outExtension: () => ({ js: ".js", dts: ".d.ts" }),
  clean: true,
  target: "es2020",
  external: ["@vtex/ads-core", "@faststore/sdk", "react"],
  splitting: false,
  bundle: true,
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/clients/adServer/index.ts",
    "src/clients/search/index.ts",
  ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  outDir: "dist",
  outExtension: () => ({ js: ".js", dts: ".d.ts" }),
  clean: true,
  target: "es2020",
  splitting: false,
  bundle: true,
});

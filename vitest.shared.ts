import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Base config shared by the root run and every package's own vitest config.
export default defineConfig({
  resolve: {
    alias: {
      // Tests read core from its source, so they don't depend on core's dist
      // being built (or being rebuilt by a build running at the same time).
      "@vtex/ads-core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      exclude: ["**/*.test.{js,jsx,ts,tsx}"],
    },
  },
});

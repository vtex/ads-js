import { defineConfig } from "vitest/config";

// Base config shared by the root run and every package's own vitest config.
export default defineConfig({
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

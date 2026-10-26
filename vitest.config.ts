import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: ["**/*.test.{js,jsx,ts,tsx}"],
    },
  },
});

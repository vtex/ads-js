import { defineConfig, mergeConfig } from "vitest/config";
import shared from "./vitest.shared";

// Packages that are not tested (and not measured for coverage).
const ignored = ["packages/ads-docs/**", "packages/playground/**"];

// Root run: one vitest process over every package, so coverage ends up in a
// single coverage/lcov.info with root-relative paths (read by the Sonar scan).
export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // Every package with its own vitest.config.ts is a project.
      projects: ["packages/*/vitest.config.ts"],
      coverage: {
        reportsDirectory: "./coverage",
        include: ["packages/*/src/**/*.{js,jsx,ts,tsx}"],
        exclude: ignored,
      },
    },
  }),
);

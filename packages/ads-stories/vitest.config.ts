import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared";

// Used when running this package alone (pnpm --filter or turbo run test).
// The root vitest.config.ts runs every package together.
export default mergeConfig(
  shared,
  defineConfig({
    test: {
      name: "ads-stories",
      environment: "jsdom",
      coverage: { include: ["src/**/*.{js,jsx,ts,tsx}"] },
    },
  }),
);

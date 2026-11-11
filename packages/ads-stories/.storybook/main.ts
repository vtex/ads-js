import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/web-components-vite";

// STORIES_SOURCE=cdn: the stories load the built standalone script from
// dist/cdn, the same file the CDN serves (run `pnpm build` first). Otherwise
// they load the source, reloading on save.
const ELEMENT =
  process.env.STORIES_SOURCE === "cdn"
    ? "../dist/cdn/vtex-ads-stories.js"
    : "../src/cdn.ts";

type ViteAlias = NonNullable<
  NonNullable<Awaited<ReturnType<ViteFinal>>["resolve"]>["alias"]
>;
type ViteFinal = NonNullable<StorybookConfig["viteFinal"]>;

// Vite takes aliases as a list or as an object: the list keeps both.
const toAliasList = (alias?: ViteAlias) =>
  Array.isArray(alias)
    ? alias
    : Object.entries(alias ?? {}).map(([find, replacement]) => ({
        find,
        replacement,
      }));

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  framework: "@storybook/web-components-vite",
  core: { disableTelemetry: true },
  viteFinal: (vite) => ({
    ...vite,
    resolve: {
      ...vite.resolve,
      alias: [
        ...toAliasList(vite.resolve?.alias),
        {
          find: /^vtex-ads-stories-element$/,
          replacement: fileURLToPath(new URL(ELEMENT, import.meta.url)),
        },
      ],
    },
  }),
};

export default config;

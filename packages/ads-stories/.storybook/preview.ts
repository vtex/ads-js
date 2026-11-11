import type { Preview } from "@storybook/web-components-vite";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers } from "../stories/handlers";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

const preview: Preview = {
  loaders: [mswLoader()],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    msw: handlers,
  },
};

export default preview;

import type { Preview } from "@storybook/web-components-vite";
// Before the element: the source build reads fetch when @vtex/ads-core loads.
import "../stories/mock-fetch";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
};

export default preview;

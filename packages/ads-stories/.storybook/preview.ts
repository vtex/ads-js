import type { Preview } from "@storybook/web-components-vite";
import "./preview.css";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers } from "../stories/handlers";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

const msw = mswLoader();

const preview: Preview = {
  // The toolbar's Ad API: "mock" answers with the handlers, "live" sends
  // the requests to the production ad API (set the publisher-id and
  // placement controls to the ones to try).
  globalTypes: {
    adApi: {
      description: "Ad API",
      toolbar: {
        icon: "globe",
        items: [
          { value: "mock", title: "Mocked ad API" },
          { value: "live", title: "Production ad API" },
        ],
        dynamicTitle: true,
      },
    },
  },
  args: { publisherId: "7082a92d-9ff7-48a3-9c12-6ae3d64e405e" },
  initialGlobals: { adApi: "mock" },
  loaders: [
    (context) =>
      msw({
        ...context,
        parameters: {
          ...context.parameters,
          msw: context.globals.adApi === "live" ? [] : handlers,
        },
      }),
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
};

export default preview;

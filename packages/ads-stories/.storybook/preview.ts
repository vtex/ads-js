import type { Preview } from "@storybook/web-components-vite";
import { html } from "lit";
import "./preview.css";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers } from "../stories/handlers";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

const msw = mswLoader();

const preview: Preview = {
  // The toolbar's Ad API: "mock" answers with the handlers, "live" sends
  // the requests to the production ad API (set the publisher-id and
  // placement controls to the ones to try). Live is end to end: the
  // impressions, views and clicks go to the real event URLs the ads carry,
  // and count.
  globalTypes: {
    adApi: {
      description: "Ad API",
      toolbar: {
        icon: "globe",
        items: [
          { value: "mock", title: "Mocked ad API" },
          { value: "live", title: "Production ad API (sends events)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  // Over every story in live mode, so the real events aren't a surprise.
  decorators: [
    (story, { globals }) =>
      globals.adApi === "live"
        ? html`
            <div class="live-alert" role="alert">
              <strong>Production ad API.</strong> This story sends real
              impressions, views and clicks, and they count. Switch the
              toolbar's Ad API back to mocked to test without them.
            </div>
            ${story()}
          `
        : story(),
  ],
  args: { publisherId: "7082a92d-9ff7-48a3-9c12-6ae3d64e405e" },
  initialGlobals: { adApi: "mock" },
  loaders: [
    async (context) => {
      await msw(context);
      if (context.globals.adApi === "live") context.msw.resetHandlers();
      return {};
    },
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    msw: handlers,
  },
};

export default preview;

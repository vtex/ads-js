import type { Preview } from "@storybook/web-components-vite";
import { html } from "lit";
import "./preview.css";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers, liveHandlers } from "../stories/handlers";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

const msw = mswLoader();

const preview: Preview = {
  // The toolbar's Ad API: "mock" answers with the handlers, "live" sends
  // the ad request to the production ad API (set the publisher-id and
  // placement controls to the ones to try). The impressions, views and
  // clicks of the real Stories stay caught by MSW (see liveHandlers), so
  // they don't count for the advertiser.
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
  // Over every story in live mode, so the real Stories aren't a surprise.
  decorators: [
    (story, { globals }) =>
      globals.adApi === "live"
        ? html`
            <div class="live-alert" role="alert">
              <strong>Production ad API.</strong> These are real Stories. Their
              impressions, views and clicks are logged to the console, not sent.
              Switch the toolbar's Ad API back to mocked for the test Stories.
            </div>
            ${story()}
          `
        : story(),
  ],
  initialGlobals: { adApi: "mock" },
  loaders: [
    async (context) => {
      await msw(context);
      if (context.globals.adApi === "live") {
        context.msw.resetHandlers();
        context.msw.use(...liveHandlers);
      }
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

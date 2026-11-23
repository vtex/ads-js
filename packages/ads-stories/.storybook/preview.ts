import type { Preview } from "@storybook/web-components-vite";
import { html } from "lit";
import "./preview.css";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers, liveHandlers } from "../stories/handlers";
// The source or the CDN build, as set in main.ts.
import "vtex-ads-stories-element";

// The worker is requested next to iframe.html, so Storybook also works when
// served under a sub path (GitHub Pages), not only at the root.
const setupWorker = async () => {
  const { setupWorker } = await import("msw/browser");
  const { isCommonAssetRequest } = await import("msw");
  const worker = setupWorker();
  await worker.start({
    quiet: true,
    serviceWorker: { url: "./mockServiceWorker.js" },
    onUnhandledRequest(request, print) {
      if (
        isCommonAssetRequest(request) ||
        /iframe\.html|sb-|@vite|\/virtual:|\.stories\./.test(request.url)
      )
        return;
      print.warning();
    },
  });
  return worker;
};

const msw = mswLoader(setupWorker);

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
    (story, { globals, title }) =>
      globals.adApi === "live" && title !== "Introduction"
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
    options: {
      storySort: {
        order: [
          "Introduction",
          "Story",
          "Custom CSS",
          "Custom labels",
          "Commerce events",
        ],
      },
    },
    controls: { expanded: true },
    msw: handlers,
  },
};

export default preview;

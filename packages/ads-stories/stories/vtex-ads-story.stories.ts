import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { StoryHydration } from "../src";
import { REDUCED_MOTION } from "../src/components/media";
import { mockStories } from "../src/story/story.mock";
import { elementArgTypes, renderElement, type ElementArgs } from "./template";

const meta: Meta<ElementArgs> = {
  title: "Story",
  args: { placement: "home_stories", inactiveAutoplay: false },
  argTypes: { ...elementArgTypes, theme: { control: false } },
  render: renderElement,
};

export default meta;

type Story = StoryObj<ElementArgs>;

export const Default: Story = {};

export const TwoStories: Story = {
  args: { placement: "two_stories" },
  parameters: {
    note: html`Side by side: the highlight moves every 5 s (not while the
    pointer is over it), with the arrows, a swipe or a click on the other card.
    Only the highlighted card plays.`,
  },
};

export const TwoStoriesInactiveAutoplay: Story = {
  name: "Two Stories, inactive autoplay",
  args: { placement: "two_stories", inactiveAutoplay: true },
  parameters: {
    note: html`With <code>inactive-autoplay</code>, the other card also plays,
      muted.`,
  },
};

export const ThreeStories: Story = {
  args: { placement: "three_stories" },
  parameters: {
    note: html`The highlighted card in the middle, the others around it: every
    card moves one place per step.`,
  },
};

export const FourStories: Story = {
  args: { placement: "four_stories" },
  parameters: {
    note: html`Two cards on each side: the Story opposite the highlighted one
    shows at both ends.`,
  },
};

export const CustomSlideDuration: Story = {
  name: "Custom slide duration",
  args: { placement: "three_stories", slideDuration: 2000 },
  parameters: {
    note: html`With <code>slide-duration="2000"</code>, the highlight moves
      every 2 s instead of 5 s. Change the control to try other values.`,
  },
};

export const NoAutomaticAdvance: Story = {
  name: "No automatic advance",
  args: { placement: "three_stories", slideDuration: 0 },
  parameters: {
    note: html`With <code>slide-duration="0"</code>, the highlight stays put: it
      moves only with the arrows, a swipe or a click on another card.`,
  },
};

// Makes the page report a preference for reduced motion to scripts, until the
// returned cleanup. CSS media queries still follow the real setting.
function fakeReducedMotion() {
  const matchMedia = globalThis.matchMedia;
  globalThis.matchMedia = (query: string) =>
    query === REDUCED_MOTION
      ? ({
          matches: true,
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        } satisfies MediaQueryList)
      : matchMedia.call(globalThis, query);
  return () => {
    globalThis.matchMedia = matchMedia;
  };
}

export const ReducedMotion: Story = {
  name: "Reduced motion",
  args: { placement: "three_stories", slideDuration: 2000 },
  beforeEach: fakeReducedMotion,
  parameters: {
    note: html`For shoppers who prefer reduced motion: the cards stay on their
      covers and the highlight doesn't move on its own, even with
      <code>slide-duration="2000"</code>; only the arrows, a swipe or a click
      move it. Opening a card plays its video in the player, and the expanded
      player steps between Stories without the slide animation. This story fakes
      the preference for the scripts only, so the CSS transitions still run. To
      check those, or to switch the preference live on any story, open the
      canvas in a new tab and, in Chrome DevTools, Rendering → Emulate CSS media
      feature <code>prefers-reduced-motion</code>.`,
  },
};

export const SlowAdServer: Story = {
  name: "Slow ad server",
  args: { placement: "slow_stories" },
  parameters: {
    note: html`The response takes 3 s, longer than the default 2 s timeout: a
    skeleton shows for 2 s, then nothing renders below.`,
  },
};

export const SlowAdServerLongerTimeout: Story = {
  name: "Slow ad server, longer timeout",
  args: { placement: "slow_stories", timeout: 5000 },
  parameters: {
    note: html`Same 3 s response, with <code>timeout="5000"</code>: the card
      shows up after 3 s.`,
  },
};

export const SlowMedia: Story = {
  name: "Slow media",
  args: { placement: "slow_media" },
  parameters: {
    note: html`A skeleton pulses where the cards will be, first while the ad
    server answers (1 s), then while the first Story's cover loads (2 s). Then
    it fades out and the cards show; the other images, also 2 s, arrive as the
    cards render. Past 3 s the cards would show anyway.`,
  },
};

export const VideoError: Story = {
  name: "Video error",
  args: { placement: "video_error" },
  parameters: {
    note: html`The images and the video take 2 s. The first Story's video fails
      twice. On the card, its cover shows with <b>Video unavailable</b>
      over it. Opening it, it fails again and the player offers
      <b>Try again</b>: a spinner shows with <b>Loading video</b> for the 2 s
      the video takes, then it plays with the sound on. Reload the story to see
      it fail again.`,
  },
};

export const SlowMediaTimeout: Story = {
  name: "Slow media, past the time limit",
  args: { placement: "slow_media_timeout" },
  parameters: {
    note: html`The images take 5 s, longer than the 3 s the skeleton waits for
    the first Story's cover: after 3 s it fades out and the cards show without
    their images, which fill in at 5 s.`,
  },
};

export const ProductHydration: Story = {
  name: "Product hydration",
  args: { placement: "three_stories", accountName: "playground" },
  parameters: {
    note: html`With <code>account-name</code>, the element asks Intelligent
      Search (mocked) for the products once the cards show. For 2 s the prices
      and the player's add to cart show placeholders; then the fetched prices
      replace the ad server's (the first product drops from R$ 129,90 to R$
      99,90, the third gets a price it didn't have). The second one is out of
      stock: <em>Esgotado</em>, and a disabled <em>Produto indisponível</em> in
      the player.`,
  },
};

export const ProductHydrationSlow: Story = {
  name: "Product hydration, slow",
  args: { placement: "three_stories", accountName: "playground-slow" },
  parameters: {
    note: html`Intelligent Search takes 8 s, longer than the default 5 s
      <code>hydration-timeout</code>: after 5 s the placeholders give way to the
      ad server's prices.`,
  },
};

export const ProductHydrationFailing: Story = {
  name: "Product hydration, failing",
  args: { placement: "three_stories", accountName: "playground-error" },
  parameters: {
    note: html`Intelligent Search answers with an error after 1 s: the ad
    server's prices show, and the console logs the failure.`,
  },
};

// Waits like the network, and rejects when the request is cancelled, as
// fetch does.
const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal?.throwIfAborted();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

// A store's own strategy: a fake catalog answering in 1.5 s, with every
// product R$ 10,00 below its ad server price.
const catalog: Record<string, number> = Object.fromEntries(
  mockStories.flatMap(({ product }) =>
    product
      ? [
          [
            product.product_sku,
            Number(
              product.product_metadata.promotional_price ??
                product.product_metadata.price ??
                60,
            ) - 10,
          ],
        ]
      : [],
  ),
);

type CatalogProduct = { skuId: string; amount: number };

const customHydration: StoryHydration<CatalogProduct> = {
  fetcher: async (offers, _identity, { signal } = {}) => {
    await wait(1500, signal);
    return offers.map(({ skuId }) => ({ skuId, amount: catalog[skuId] }));
  },
  matcher: (product, offer) => product.skuId === offer.skuId,
  price: (product) => ({ price: product.amount }),
};

export const ProductHydrationCustomStrategy: Story = {
  name: "Product hydration, custom strategy",
  args: { placement: "three_stories", hydration: customHydration },
  parameters: {
    note: html`The <code>hydration</code> property set to the store's own
      fetcher, matcher and price reader (a fake catalog answering in 1.5 s):
      every product costs R$ 10,00 less than on the ad server, and the one
      without a price there costs R$ 50,00.`,
  },
};

export const NoStory: Story = {
  args: { placement: "empty_stories" },
  parameters: {
    note: html`The placement comes back empty: the skeleton shows while the
    request runs, then nothing renders below.`,
  },
};

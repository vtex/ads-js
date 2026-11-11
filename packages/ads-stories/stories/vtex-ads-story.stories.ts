import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { StoryHydration } from "../src";
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

export const AnotherLanguageAndCurrency: Story = {
  name: "Another language and currency",
  args: { placement: "four_stories", lang: "es-AR", currency: "ARS" },
  parameters: {
    note: html`With <code>lang="es-AR"</code> and <code>currency="ARS"</code>,
      the product prices read <code>$ 129,90</code> instead of
      <code>R$ 129,90</code>.`,
  },
};

export const SlowAdServer: Story = {
  name: "Slow ad server",
  args: { placement: "slow_stories" },
  parameters: {
    note: html`The response takes 3 s, longer than the default 2 s timeout, so
    nothing renders below.`,
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
    note: html`The placement comes back empty, so nothing renders below.`,
  },
};

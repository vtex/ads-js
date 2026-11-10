import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import {
  getRawAds,
  hydrateAds,
  intelligentSearchFetcher,
  intelligentSearchPrice,
  type HydratedAds,
  type StoryAdDetail,
} from "@vtex/ads-core";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";
import {
  mockStories,
  mockStory,
  rawAdsWith,
  REQUIRED_ATTRIBUTES,
} from "./story.mock";
import type { StoryHydration } from "../utils/hydrate-products";

vi.mock("@vtex/ads-core", () => ({
  getRawAds: vi.fn(),
  hydrateAds: vi.fn(),
  intelligentSearchFetcher: vi.fn(),
  intelligentSearchMatcher: vi.fn(),
  intelligentSearchPrice: vi.fn(),
}));

const getRawAdsMock = vi.mocked(getRawAds);
const hydrateAdsMock = vi.mocked(hydrateAds);
const intelligentSearchPriceMock = vi.mocked(intelligentSearchPrice);

const WITH_ACCOUNT = { ...REQUIRED_ATTRIBUTES, "account-name": "store" };

// What hydrateAds resolves to: every Story with a product found, its offer
// and the product `{ sku }`.
function hydrated(
  stories: StoryAdDetail[],
  placement = REQUIRED_ATTRIBUTES.placement,
): HydratedAds<object> {
  return {
    sponsoredProducts: { byPlacement: {}, failed: [] },
    stories: {
      [placement]: stories.map((story) => ({
        story,
        product: story.product ? { sku: story.product.product_sku } : undefined,
        offer: story.product
          ? { skuId: story.product.product_sku, sellerId: "1", productId: "" }
          : undefined,
        advertisement: {
          eventUrls: { click: "", impression: "", view: "" },
          eventParameters: "",
        },
      })),
    },
  };
}

// Resolves with every product found, as in `hydrated`.
const findEveryProduct = () =>
  hydrateAdsMock.mockImplementation(async (ads) => {
    const [placement, stories] = Object.entries(ads.stories ?? {})[0];
    return hydrated(stories, placement);
  });

// Settles only when the request's signal aborts, like a hanging fetch.
const hangUntilAborted = () =>
  hydrateAdsMock.mockImplementation(
    (_ads, _fetcher, _matcher, _identity, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () =>
          reject(options.signal?.reason),
        );
      }),
  );

// Lets the requests resolve and the element render their result.
async function flush(el: VtexAdsStoryElement) {
  for (let i = 0; i < 3; i += 1) {
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve));
  }
  await el.updateComplete;
}

async function mount(
  attributes: Record<string, string>,
  setup?: (el: VtexAdsStoryElement) => void,
) {
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  setup?.(el);
  document.body.appendChild(el);
  await flush(el);
  return el;
}

const pill = (el: VtexAdsStoryElement) =>
  el.shadowRoot?.querySelector<HTMLButtonElement>(".card-product");
const priceOf = (el: VtexAdsStoryElement) =>
  pill(el)
    ?.querySelector(".product-price > span")
    ?.textContent?.replace(/\s/g, " ")
    .trim();
const skeletonOf = (el: VtexAdsStoryElement) =>
  pill(el)?.querySelector(".product-price-loading");

async function openPanel(el: VtexAdsStoryElement) {
  pill(el)?.click();
  await el.updateComplete;
  await el.updateComplete;
  return el.shadowRoot?.querySelector(".player .product-panel");
}

describe("vtex-ads-story product hydration", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStories();
  });

  beforeEach(() => {
    getRawAdsMock.mockReset();
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
    hydrateAdsMock.mockReset();
    findEveryProduct();
    intelligentSearchPriceMock.mockReset();
    intelligentSearchPriceMock.mockReturnValue({ price: 99.9 });
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.replaceChildren();
    consoleError.mockRestore();
  });

  it("makes no product request without account-name or strategy", async () => {
    const el = await mount(REQUIRED_ATTRIBUTES);

    expect(hydrateAdsMock).not.toHaveBeenCalled();
    expect(priceOf(el)).toBe("R$ 129,90");
    expect(skeletonOf(el)).toBeNull();
    expect(
      (await openPanel(el))?.querySelector(".product-add-to-cart"),
    ).not.toBeNull();
  });

  it("uses Intelligent Search by default with account-name", async () => {
    const el = await mount(WITH_ACCOUNT);

    expect(hydrateAdsMock).toHaveBeenCalledTimes(1);
    const [ads, fetcher, , identity] = hydrateAdsMock.mock.calls[0];
    expect(ads).toEqual({ stories: { home_stories: [mockStory] } });
    expect(fetcher).toBe(intelligentSearchFetcher);
    expect(identity).toMatchObject({
      accountName: "store",
      publisherId: "publisher-1",
      sessionId: "session-1",
    });
    expect(intelligentSearchPriceMock).toHaveBeenCalledWith(
      { sku: "sku-1" },
      { skuId: "sku-1", sellerId: "1", productId: "" },
    );
    expect(priceOf(el)).toBe("R$ 99,90");
  });

  it("shows add to cart once the price is fetched", async () => {
    const el = await mount(WITH_ACCOUNT);

    const panel = await openPanel(el);
    expect(panel?.querySelector(".product-add-to-cart")).not.toBeNull();
    expect(
      el.shadowRoot?.querySelector(".player .product-price > span")
        ?.textContent,
    ).toContain("99,90");
  });

  it("shows placeholders for the price and add to cart while loading", async () => {
    hangUntilAborted();
    const el = await mount(WITH_ACCOUNT);

    expect(skeletonOf(el)).not.toBeNull();
    expect(priceOf(el)).toBeUndefined();
    expect(pill(el)?.getAttribute("aria-label")).toBe(
      mockStory.product?.product_name,
    );
    const panel = await openPanel(el);
    expect(panel?.querySelector(".product-add-to-cart")).toBeNull();
    expect(panel?.querySelector(".product-add-to-cart-loading")).not.toBeNull();
  });

  it("uses the strategy set as a property", async () => {
    const strategy: StoryHydration = {
      fetcher: vi.fn(),
      matcher: vi.fn(),
      price: vi.fn(() => ({ price: 50, listPrice: 70 })),
    };

    const el = await mount(REQUIRED_ATTRIBUTES, (element) => {
      element.hydration = strategy;
    });

    expect(hydrateAdsMock.mock.calls[0][1]).toBe(strategy.fetcher);
    expect(strategy.price).toHaveBeenCalledTimes(1);
    expect(priceOf(el)).toBe("R$ 50,00");
    expect(
      pill(el)?.querySelector(".product-list-price")?.textContent?.trim(),
    ).toContain("70,00");
  });

  it("makes no product request with hydration=none", async () => {
    const el = await mount({ ...WITH_ACCOUNT, hydration: "none" });

    expect(hydrateAdsMock).not.toHaveBeenCalled();
    expect(priceOf(el)).toBe("R$ 129,90");
  });

  it("makes no product request when every Story is a link", async () => {
    const link = mockStories.find((story) => story.product === null)!;
    getRawAdsMock.mockResolvedValue(rawAdsWith([link]));

    await mount(WITH_ACCOUNT);

    expect(hydrateAdsMock).not.toHaveBeenCalled();
  });

  it("falls back to the ad server's price when the request fails", async () => {
    hydrateAdsMock.mockRejectedValue(new Error("HTTP error! status: 500"));

    const el = await mount(WITH_ACCOUNT);

    expect(priceOf(el)).toBe("R$ 129,90");
    expect(skeletonOf(el)).toBeNull();
    expect(
      (await openPanel(el))?.querySelector(".product-add-to-cart"),
    ).not.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "[vtex-ads-story] Product request failed",
      expect.any(Error),
    );
  });

  it("shows a price of 0 as the strategy returns it", async () => {
    intelligentSearchPriceMock.mockReturnValue({ price: 0 });

    const el = await mount(WITH_ACCOUNT);

    expect(priceOf(el)).toBe("R$ 0,00");
    expect(
      (await openPanel(el))?.querySelector(".product-add-to-cart"),
    ).not.toBeNull();
  });

  it("falls back after hydration-timeout, without a log", async () => {
    hangUntilAborted();
    const el = await mount({ ...WITH_ACCOUNT, "hydration-timeout": "20" });
    expect(skeletonOf(el)).not.toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 40));
    await flush(el);

    expect(skeletonOf(el)).toBeNull();
    expect(priceOf(el)).toBe("R$ 129,90");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("ignores the prices of an earlier request", async () => {
    let resolveFirst!: (value: HydratedAds<object>) => void;
    hydrateAdsMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolveFirst = resolve)),
    );
    const el = await mount(WITH_ACCOUNT);

    intelligentSearchPriceMock.mockReturnValue({ price: 10 });
    el.setAttribute("user-id", "user-2");
    await flush(el);
    expect(priceOf(el)).toBe("R$ 10,00");

    intelligentSearchPriceMock.mockReturnValue({ price: 20 });
    resolveFirst(hydrated([mockStory]));
    await flush(el);

    expect(priceOf(el)).toBe("R$ 10,00");
  });
});

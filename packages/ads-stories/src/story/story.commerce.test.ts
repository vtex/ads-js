import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { getRawAds, type StoryAdDetail } from "@vtex/ads-core";
import {
  defineVtexAdsStoryCarousel,
  TAG_NAME,
  type VtexAdsStoryCarouselElement,
} from "./story";
import {
  ADD_TO_CART_EVENT,
  type StoryAddToCartEvent,
} from "../commerce-events";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";
import { mockStories, rawAdsWith, REQUIRED_ATTRIBUTES } from "./story.mock";

vi.mock("@vtex/ads-core", () => ({
  getRawAds: vi.fn(),
  hydrateAds: vi.fn(),
  intelligentSearchFetcher: vi.fn(),
  intelligentSearchMatcher: vi.fn(),
  intelligentSearchPrice: vi.fn(),
  intelligentSearchAvailability: vi.fn(),
}));

const getRawAdsMock = vi.mocked(getRawAds);

const [story1, story2] = mockStories;

async function mount(stories: StoryAdDetail[]) {
  getRawAdsMock.mockResolvedValue(rawAdsWith(stories));
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(REQUIRED_ATTRIBUTES)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((resolve) => setTimeout(resolve));
  await el.updateComplete;
  return el;
}

const query = (el: VtexAdsStoryCarouselElement, selector: string) =>
  el.shadowRoot?.querySelector<HTMLElement>(selector) ?? null;

async function click(el: VtexAdsStoryCarouselElement, selector: string) {
  const target = query(el, selector);
  if (!target) throw new Error(`Nothing matches ${selector}`);
  target.click();
  await el.updateComplete;
  await el.updateComplete;
}

/** Opens the player with the product panel open, from the card's product. */
const openPanel = (el: VtexAdsStoryCarouselElement) =>
  click(el, ".card-product");

function listen(target: EventTarget = document) {
  const events: StoryAddToCartEvent[] = [];
  target.addEventListener(ADD_TO_CART_EVENT, (event) =>
    events.push(event as StoryAddToCartEvent),
  );
  return events;
}

describe(`${TAG_NAME} add to cart`, () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStoryCarousel();
  });

  beforeEach(() => {
    getRawAdsMock.mockReset();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("dispatches the product's SKU and a quantity of 1 from the element", async () => {
    const el = await mount([story1]);
    const events = listen(el);
    await openPanel(el);

    await click(el, ".player .product-add-to-cart");

    expect(events).toHaveLength(1);
    const [event] = events;
    expect(event.detail).toEqual({
      sku: story1.product?.product_sku,
      quantity: 1,
    });
    expect(event.target).toBe(el);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("reaches the document", async () => {
    const el = await mount([story1]);
    const events = listen(document);
    await openPanel(el);

    await click(el, ".player .product-add-to-cart");

    expect(events).toHaveLength(1);
  });

  it("keeps the player and the panel open", async () => {
    const el = await mount([story1]);
    await openPanel(el);

    await click(el, ".player .product-add-to-cart");

    expect(query(el, "dialog.player")).not.toBeNull();
    expect(query(el, ".player .card-product")?.hasAttribute("data-open")).toBe(
      true,
    );
  });

  it("sends the SKU of the Story the player shows", async () => {
    const el = await mount([story1, story2]);
    const events = listen(el);
    await click(el, ".slide[data-active] .card-open");
    await click(el, ".player-next");
    await click(el, ".player .product-summary");

    await click(el, ".player .product-add-to-cart");

    expect(events.map((event) => event.detail.sku)).toEqual([
      story2.product?.product_sku,
    ]);
  });

  it("has no add to cart for a product without a SKU", async () => {
    const withoutSku = {
      ...story1,
      product: story1.product && { ...story1.product, product_sku: " " },
    };
    const el = await mount([withoutSku]);
    await openPanel(el);

    expect(query(el, ".player .product-add-to-cart")).toBeNull();
    expect(query(el, ".player .product-view")).not.toBeNull();
  });
});

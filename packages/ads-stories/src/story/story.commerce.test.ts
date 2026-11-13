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
  REMOVE_FROM_CART_EVENT,
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

// Aborted after each test: the listeners on the document go with it.
let listeners = new AbortController();

function listen(target: EventTarget = document) {
  const events: StoryAddToCartEvent[] = [];
  target.addEventListener(
    ADD_TO_CART_EVENT,
    (event) => events.push(event as StoryAddToCartEvent),
    { signal: listeners.signal },
  );
  return events;
}

/** Both cart events, in order: their type and detail. */
function listenCart(target: EventTarget) {
  const events: { type: string; detail: unknown }[] = [];
  for (const type of [ADD_TO_CART_EVENT, REMOVE_FROM_CART_EVENT]) {
    target.addEventListener(
      type,
      (event) => events.push({ type, detail: (event as CustomEvent).detail }),
      { signal: listeners.signal },
    );
  }
  return events;
}

const quantityShown = (el: VtexAdsStoryCarouselElement) =>
  query(el, ".player .product-quantity")?.textContent?.trim();

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
    listeners.abort();
    listeners = new AbortController();
    vi.restoreAllMocks();
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("dispatches the product's SKU, seller and a quantity of 1 from the element", async () => {
    const el = await mount([story1]);
    const events = listen(el);
    await openPanel(el);

    await click(el, ".player .product-add-to-cart");

    expect(events).toHaveLength(1);
    const [event] = events;
    expect(event.detail).toEqual({
      sku: story1.product?.product_sku,
      seller: story1.product?.seller_id,
      quantity: 1,
    });
    expect(event.target).toBe(el);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("leaves the seller out when the product has none", async () => {
    const withoutSeller = {
      ...story1,
      product: story1.product && { ...story1.product, seller_id: undefined },
    };
    const el = await mount([withoutSeller]);
    const events = listen(el);
    await openPanel(el);

    await click(el, ".player .product-add-to-cart");

    expect(events[0]?.detail).toEqual({
      sku: story1.product?.product_sku,
      quantity: 1,
    });
    expect(events[0]?.detail).not.toHaveProperty("seller");
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

  describe("stepper", () => {
    const item1 = {
      sku: story1.product?.product_sku,
      seller: story1.product?.seller_id,
    };

    it("replaces add to cart once added, and sends plus and minus", async () => {
      const el = await mount([story1]);
      const events = listenCart(el);
      await openPanel(el);

      await click(el, ".player .product-add-to-cart");
      expect(query(el, ".player .product-add-to-cart")).toBeNull();
      expect(quantityShown(el)).toBe("1");

      await click(el, ".player .product-stepper-add");
      expect(quantityShown(el)).toBe("2");

      await click(el, ".player .product-stepper-remove");
      expect(quantityShown(el)).toBe("1");

      expect(events).toEqual([
        { type: ADD_TO_CART_EVENT, detail: { ...item1, quantity: 1 } },
        { type: ADD_TO_CART_EVENT, detail: { ...item1, quantity: 1 } },
        { type: REMOVE_FROM_CART_EVENT, detail: { ...item1, quantity: 1 } },
      ]);
    });

    it("goes back to add to cart when the trash removes the last one", async () => {
      const el = await mount([story1]);
      const events = listenCart(el);
      await openPanel(el);
      await click(el, ".player .product-add-to-cart");

      const trash = query(el, ".player .product-stepper-remove");
      expect(trash?.getAttribute("aria-label")).toBe("Remover do carrinho");
      await click(el, ".player .product-stepper-remove");

      expect(query(el, ".player .product-stepper")).toBeNull();
      expect(query(el, ".player .product-add-to-cart")).not.toBeNull();
      expect(events.map((event) => event.type)).toEqual([
        ADD_TO_CART_EVENT,
        REMOVE_FROM_CART_EVENT,
      ]);
    });

    it("moves the focus to the control that takes the clicked one's place", async () => {
      const el = await mount([story1]);
      await openPanel(el);

      await click(el, ".player .product-add-to-cart");
      expect(el.shadowRoot?.activeElement).toBe(
        query(el, ".player .product-stepper-add"),
      );

      await click(el, ".player .product-stepper-remove");
      expect(el.shadowRoot?.activeElement).toBe(
        query(el, ".player .product-add-to-cart"),
      );
    });

    it("bubbles and is composed, as add to cart", async () => {
      const el = await mount([story1]);
      await openPanel(el);
      await click(el, ".player .product-add-to-cart");
      const removed: Event[] = [];
      document.addEventListener(
        REMOVE_FROM_CART_EVENT,
        (event) => removed.push(event),
        { signal: listeners.signal },
      );

      await click(el, ".player .product-stepper-remove");

      expect(removed).toHaveLength(1);
      expect(removed[0].bubbles).toBe(true);
      expect(removed[0].composed).toBe(true);
    });

    it("counts each SKU apart while the player is open", async () => {
      const el = await mount([story1, story2]);
      await click(el, ".slide[data-active] .card-open");
      await click(el, ".player .product-summary");
      await click(el, ".player .product-add-to-cart");
      await click(el, ".player .product-stepper-add");

      await click(el, ".player-next");
      await click(el, ".player .product-summary");
      expect(query(el, ".player .product-add-to-cart")).not.toBeNull();

      await click(el, ".player-previous");
      await click(el, ".player .product-summary");
      expect(quantityShown(el)).toBe("2");
    });

    it("starts over when the player opens again", async () => {
      const el = await mount([story1]);
      const events = listenCart(el);
      await openPanel(el);
      await click(el, ".player .product-add-to-cart");
      await click(el, ".player .product-stepper-add");

      await click(el, ".player-close");
      await openPanel(el);

      expect(query(el, ".player .product-stepper")).toBeNull();
      expect(query(el, ".player .product-add-to-cart")).not.toBeNull();
      // Nothing is sent to the store: its cart keeps what was added.
      expect(events).toHaveLength(2);
    });
  });
});

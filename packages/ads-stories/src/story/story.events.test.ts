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
import { VIEW_DURATION_MS } from "../components/events";
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

// Each Story with its own event URLs, so the beacons tell them apart.
const withEventUrls = (story: StoryAdDetail): StoryAdDetail => ({
  ...story,
  impression_url: `https://events.example/impression/${story.ad_id}`,
  view_url: `https://events.example/view/${story.ad_id}`,
  click_url: `https://events.example/click/${story.ad_id}`,
});

const [story1, story2, story3] = mockStories.map(withEventUrls);

// A link Story: a call to action instead of a product.
const linkStory: StoryAdDetail = withEventUrls({
  ...mockStories[0],
  ad_id: "story-ad-link",
  product: null,
  destination_url: "https://www.example.com/promo",
  call_to_action: "Saiba mais",
});

/** The URLs beaconed so far, in order. */
const beaconed = () =>
  vi.mocked(navigator.sendBeacon).mock.calls.map(([url]) => String(url));

const beaconedOf = (kind: string) =>
  beaconed().filter((url) => url.includes(`/${kind}/`));

/**
 * IntersectionObserver as the element uses it: tests report how much of an
 * element is on screen with intersect().
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
  }

  report(target: Element, ratio: number) {
    if (!this.observed.has(target)) return;
    this.callback(
      [
        {
          target,
          intersectionRatio: ratio,
          isIntersecting: ratio > 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

const observed = () =>
  FakeIntersectionObserver.instances.flatMap((o) => [...o.observed]);

function intersect(element: Element | null | undefined, ratio: number) {
  if (!element) throw new Error("No element to intersect");
  for (const observer of FakeIntersectionObserver.instances) {
    observer.report(element, ratio);
  }
}

async function flushRequest(el: VtexAdsStoryCarouselElement) {
  await el.updateComplete;
  await new Promise((resolve) => setTimeout(resolve));
  await el.updateComplete;
}

async function mount(
  stories: StoryAdDetail[],
  attributes: Record<string, string> = REQUIRED_ATTRIBUTES,
) {
  getRawAdsMock.mockResolvedValue(rawAdsWith(stories));
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  await flushRequest(el);
  return el;
}

const query = <E extends Element = HTMLElement>(
  el: VtexAdsStoryCarouselElement,
  selector: string,
) => el.shadowRoot?.querySelector<E>(selector) ?? null;

async function click(el: VtexAdsStoryCarouselElement, selector: string) {
  const target = query(el, selector);
  if (!target) throw new Error(`Nothing matches ${selector}`);
  target.click();
  await el.updateComplete;
  await el.updateComplete;
}

describe(`${TAG_NAME} events`, () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStoryCarousel();
  });

  beforeEach(() => {
    getRawAdsMock.mockReset();
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("impression", () => {
    it("sends each Story's impression once the carousel renders", async () => {
      await mount([story1, story2, story3]);

      expect(beaconedOf("impression")).toEqual([
        story1.impression_url,
        story2.impression_url,
        story3.impression_url,
      ]);
    });

    it("posts the session and the user", async () => {
      await mount([story1], { ...REQUIRED_ATTRIBUTES, "user-id": "user-9" });

      const blob = vi.mocked(navigator.sendBeacon).mock.calls[0][1] as Blob;
      expect(JSON.parse(await blob.text())).toEqual({
        session_id: REQUIRED_ATTRIBUTES["session-id"],
        user_id: "user-9",
      });
    });

    it("sends it once per session, even when the Stories come again", async () => {
      const el = await mount([story1, story2]);

      el.setAttribute("quantity", "4");
      await flushRequest(el);
      expect(beaconedOf("impression")).toHaveLength(2);

      el.setAttribute("session-id", "session-2");
      await flushRequest(el);
      expect(beaconedOf("impression")).toHaveLength(4);
    });

    it("sends nothing without Stories", async () => {
      await mount([]);

      expect(beaconed()).toEqual([]);
    });

    it("sends nothing for a Story without a valid impression URL", async () => {
      await mount([{ ...story1, impression_url: "" }, story2]);

      expect(beaconedOf("impression")).toEqual([story2.impression_url]);
    });
  });

  describe("click", () => {
    it("sends the click on the first touch on the card, once", async () => {
      const el = await mount([story1]);

      await click(el, ".card-open");
      await click(el, ".card-product");

      expect(beaconedOf("click")).toEqual([story1.click_url]);
    });

    it("counts a touch on the product", async () => {
      const el = await mount([story1]);

      await click(el, ".carousel .card-product");

      expect(beaconedOf("click")).toEqual([story1.click_url]);
    });

    it("counts a touch on the call to action", async () => {
      const el = await mount([linkStory]);
      const cta = query<HTMLAnchorElement>(el, ".carousel .card-cta");
      // jsdom would try to navigate.
      cta?.addEventListener("click", (event) => event.preventDefault());

      await click(el, ".carousel .card-cta");

      expect(beaconedOf("click")).toEqual([linkStory.click_url]);
    });

    it("counts a touch on a card without the highlight, for its Story", async () => {
      const el = await mount([story1, story2, story3]);

      await click(
        el,
        ".slide:not([data-active]):not([data-hidden]) .card-open",
      );

      expect(beaconedOf("click")).toHaveLength(1);
      expect(beaconedOf("click")[0]).not.toBe(story1.click_url);
    });

    it("counts the player's product, not its video or buttons", async () => {
      const el = await mount([story1, story2]);

      await click(el, ".slide[data-active] .card-open");
      expect(beaconedOf("click")).toEqual([story1.click_url]);

      // The next Story, reached in the player: no touch on its card.
      await click(el, ".player-next");
      await click(el, ".player .player-stage > .card");
      expect(beaconedOf("click")).toEqual([story1.click_url]);

      await click(el, ".player .product-summary");
      expect(beaconedOf("click")).toEqual([story1.click_url, story2.click_url]);
    });
  });

  describe("view", () => {
    const activeCard = (el: VtexAdsStoryCarouselElement) =>
      query(
        el,
        '.carousel[data-layout="solo"] > .card, .slide[data-active] > .card',
      );

    it("sends the view after half the card stayed on screen for 2 s", async () => {
      const el = await mount([story1]);
      vi.useFakeTimers();

      intersect(activeCard(el), 0.5);
      vi.advanceTimersByTime(VIEW_DURATION_MS - 1);
      expect(beaconedOf("view")).toEqual([]);

      vi.advanceTimersByTime(1);
      expect(beaconedOf("view")).toEqual([story1.view_url]);
    });

    it("starts over when the card leaves the screen before 2 s", async () => {
      const el = await mount([story1]);
      vi.useFakeTimers();
      const card = activeCard(el);

      intersect(card, 1);
      vi.advanceTimersByTime(VIEW_DURATION_MS - 100);
      intersect(card, 0.4);
      vi.advanceTimersByTime(VIEW_DURATION_MS);
      expect(beaconedOf("view")).toEqual([]);

      intersect(card, 0.8);
      vi.advanceTimersByTime(VIEW_DURATION_MS);
      expect(beaconedOf("view")).toEqual([story1.view_url]);
    });

    it("sends it once, and stops watching the Story", async () => {
      const el = await mount([story1]);
      vi.useFakeTimers();
      const card = activeCard(el);

      intersect(card, 1);
      vi.advanceTimersByTime(VIEW_DURATION_MS);
      intersect(card, 0);
      intersect(card, 1);
      vi.advanceTimersByTime(VIEW_DURATION_MS);

      expect(beaconedOf("view")).toEqual([story1.view_url]);
      expect(observed()).not.toContain(card);
    });

    it("stops the count while the page is hidden", async () => {
      const el = await mount([story1]);
      vi.useFakeTimers();
      const hidden = vi.spyOn(document, "hidden", "get");

      intersect(activeCard(el), 1);
      vi.advanceTimersByTime(VIEW_DURATION_MS - 100);
      hidden.mockReturnValue(true);
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(VIEW_DURATION_MS);
      expect(beaconedOf("view")).toEqual([]);

      hidden.mockReturnValue(false);
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(VIEW_DURATION_MS);
      expect(beaconedOf("view")).toEqual([story1.view_url]);
      hidden.mockRestore();
    });

    it("watches only the cards on screen, not the hidden ones", async () => {
      const el = await mount([story1, story2, story3]);

      const hiddenCards = [
        ...(el.shadowRoot?.querySelectorAll(".slide[data-hidden] > .card") ??
          []),
      ];
      const shownCards = [
        ...(el.shadowRoot?.querySelectorAll(
          ".slide:not([data-hidden]) > .card",
        ) ?? []),
      ];

      expect(hiddenCards.length).toBeGreaterThan(0);
      expect(observed()).toEqual(expect.arrayContaining(shownCards));
      for (const card of hiddenCards) expect(observed()).not.toContain(card);
    });

    it("counts the view of the Story shown in the player", async () => {
      const el = await mount([story1, story2]);
      await click(el, ".slide[data-active] .card-open");
      await click(el, ".player-next");
      vi.useFakeTimers();

      intersect(query(el, ".player .player-stage > .card"), 1);
      vi.advanceTimersByTime(VIEW_DURATION_MS);

      expect(beaconedOf("view")).toEqual([story2.view_url]);
    });

    it("stops watching when the element leaves the page", async () => {
      const el = await mount([story1]);
      vi.useFakeTimers();

      intersect(activeCard(el), 1);
      el.remove();
      vi.advanceTimersByTime(VIEW_DURATION_MS);

      expect(beaconedOf("view")).toEqual([]);
      expect(observed()).toEqual([]);
    });

    it("sends no view without IntersectionObserver", async () => {
      vi.stubGlobal("IntersectionObserver", undefined);
      await mount([story1]);
      vi.useFakeTimers();

      vi.advanceTimersByTime(VIEW_DURATION_MS * 2);

      expect(beaconedOf("view")).toEqual([]);
      expect(beaconedOf("impression")).toEqual([story1.impression_url]);
    });
  });
});

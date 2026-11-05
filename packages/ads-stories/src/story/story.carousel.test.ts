import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { getRawAds } from "@vtex/ads-core";
import {
  defineVtexAdsStories,
  TAG_NAME,
  type VtexAdsStoryElement,
} from "./story";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";
import { AUTO_ADVANCE_MS, carouselStyles } from "../components/carousel";
import {
  mockStories,
  mockStory,
  rawAdsWith,
  REQUIRED_ATTRIBUTES,
} from "./story.mock";

vi.mock("@vtex/ads-core", () => ({ getRawAds: vi.fn() }));

const getRawAdsMock = vi.mocked(getRawAds);

const secondStory = mockStories[1];

async function mount(attributes: Record<string, string> = REQUIRED_ATTRIBUTES) {
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((resolve) => setTimeout(resolve));
  await el.updateComplete;
  return el;
}

const query = <T extends Element = HTMLElement>(
  el: VtexAdsStoryElement,
  selector: string,
) => el.shadowRoot?.querySelector<T>(selector) ?? null;

const slides = (el: VtexAdsStoryElement) => [
  ...(el.shadowRoot?.querySelectorAll<HTMLElement>(".slide") ?? []),
];

const activeIndex = (el: VtexAdsStoryElement) =>
  slides(el).findIndex((slide) => slide.hasAttribute("data-active"));

const slideVideo = (el: VtexAdsStoryElement, index: number) =>
  slides(el)[index]?.querySelector("video") ?? null;

async function click(el: VtexAdsStoryElement, selector: string) {
  query(el, selector)?.click();
  await el.updateComplete;
  await el.updateComplete;
}

describe("vtex-ads-story carousel", () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStories();
  });

  beforeEach(() => {
    getRawAdsMock.mockReset();
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory, secondStory]));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("renders a single Story over the background, without arrows", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
    const el = await mount();

    expect(query(el, ".carousel")?.hasAttribute("data-solo")).toBe(true);
    expect(slides(el)).toHaveLength(0);
    expect(query(el, ".arrow")).toBeNull();
  });

  it("renders two Stories side by side, the first highlighted", async () => {
    const el = await mount();
    const carousel = query(el, ".carousel");

    expect(carousel?.hasAttribute("data-solo")).toBe(false);
    expect(carousel?.getAttribute("role")).toBe("region");
    expect(carousel?.getAttribute("aria-roledescription")).toBe("carrossel");
    expect(slides(el)).toHaveLength(2);
    expect(activeIndex(el)).toBe(0);
    expect(query(el, ".arrow-previous")).not.toBeNull();
    expect(query(el, ".arrow-next")).not.toBeNull();
  });

  it("names the highlighted card Watch and the other Show", async () => {
    const el = await mount();
    const labels = slides(el).map((slide) =>
      slide.querySelector(".card-open")?.getAttribute("aria-label"),
    );

    expect(labels).toEqual(["Assistir vídeo", "Mostrar vídeo"]);
  });

  it("moves the highlight with the arrows, wrapping around", async () => {
    const el = await mount();

    await click(el, ".arrow-next");
    expect(activeIndex(el)).toBe(1);

    await click(el, ".arrow-next");
    expect(activeIndex(el)).toBe(0);

    await click(el, ".arrow-previous");
    expect(activeIndex(el)).toBe(1);
  });

  it("gives the highlight to the other card when it is clicked", async () => {
    const el = await mount();

    await click(el, ".slide:not([data-active]) .card-open");

    expect(activeIndex(el)).toBe(1);
    expect(query(el, ".player")).toBeNull();
  });

  it("opens the highlighted Story in the player", async () => {
    const el = await mount();
    await click(el, ".arrow-next");

    await click(el, ".slide[data-active] .card-open");

    expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
      secondStory.poster_url,
    );
  });

  it("keeps the highlight while the player is open", async () => {
    const el = await mount();
    await click(el, ".slide[data-active] .card-open");

    await click(el, ".arrow-next");

    expect(activeIndex(el)).toBe(0);
    expect(query<HTMLButtonElement>(el, ".arrow-next")?.disabled).toBe(true);
  });

  it("moves the highlight on a swipe, without opening the player", async () => {
    const el = await mount();
    const track = query(el, ".track");

    track?.dispatchEvent(new PointerEvent("pointerdown", { clientX: 200 }));
    track?.dispatchEvent(new PointerEvent("pointerup", { clientX: 100 }));
    query(el, ".slide[data-active] .card-open")?.click();
    await el.updateComplete;
    await el.updateComplete;

    expect(activeIndex(el)).toBe(1);
    expect(query(el, ".player")).toBeNull();
  });

  describe("automatic advance", () => {
    it(`moves the highlight every ${AUTO_ADVANCE_MS} ms`, async () => {
      const el = await mount();
      vi.useFakeTimers();
      // The timer started on load, with real timers: start it again.
      await click(el, ".arrow-next");
      await click(el, ".arrow-previous");

      await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS - 1);
      expect(activeIndex(el)).toBe(0);

      await vi.advanceTimersByTimeAsync(1);
      expect(activeIndex(el)).toBe(1);
    });

    it("stops while the pointer is over the carousel", async () => {
      const el = await mount();
      vi.useFakeTimers();
      await click(el, ".arrow-next");

      query(el, ".carousel")?.dispatchEvent(new PointerEvent("pointerenter"));
      await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS * 2);
      expect(activeIndex(el)).toBe(1);

      query(el, ".carousel")?.dispatchEvent(new PointerEvent("pointerleave"));
      await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS);
      expect(activeIndex(el)).toBe(0);
    });

    it("stops while the player is open", async () => {
      const el = await mount();
      vi.useFakeTimers();
      await click(el, ".slide[data-active] .card-open");

      await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS * 2);

      expect(activeIndex(el)).toBe(0);
    });

    it("does not run with a single Story", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
      const el = await mount();
      vi.useFakeTimers();

      await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS * 2);

      expect(query(el, ".carousel")?.hasAttribute("data-solo")).toBe(true);
    });
  });

  describe("inactive-autoplay", () => {
    it("is off by default: only the highlighted card has a video", async () => {
      const el = await mount();

      expect(el.inactiveAutoplay).toBe(false);
      expect(slideVideo(el, 0)).not.toBeNull();
      expect(slideVideo(el, 1)).toBeNull();
      expect(slides(el)[1].querySelector(".poster")?.getAttribute("src")).toBe(
        secondStory.poster_url,
      );
    });

    it("moves the video with the highlight when off", async () => {
      const el = await mount();

      await click(el, ".arrow-next");

      expect(slideVideo(el, 0)).toBeNull();
      expect(slideVideo(el, 1)).not.toBeNull();
    });

    it("plays the other card's video too when on", async () => {
      const el = await mount({
        ...REQUIRED_ATTRIBUTES,
        "inactive-autoplay": "",
      });

      expect(el.inactiveAutoplay).toBe(true);
      expect(slideVideo(el, 0)).not.toBeNull();
      expect(slideVideo(el, 1)).not.toBeNull();
    });

    it("mutes the card that loses the highlight when on", async () => {
      const el = await mount({
        ...REQUIRED_ATTRIBUTES,
        "inactive-autoplay": "",
      });
      const video = slideVideo(el, 0);
      if (video) video.muted = false;

      await click(el, ".arrow-next");

      expect(slideVideo(el, 0)).toBe(video);
      expect(video?.muted).toBe(true);
    });

    // jsdom doesn't apply the element's styles: this checks the rule that
    // hides the dimmed card's sound button is there.
    it("hides the sound button on the card without the highlight", () => {
      expect(carouselStyles.cssText).toMatch(
        /\.slide:not\(\[data-active\]\) \.card-sound\s*\{\s*display: none;/,
      );
    });
  });
});

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
import {
  AUTO_ADVANCE_MS,
  carouselStyles,
  NARROW_SCREEN,
  RENDERED_SIDE,
} from "../components/carousel";
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

    expect(query(el, ".carousel")?.getAttribute("data-layout")).toBe("solo");
    expect(slides(el)).toHaveLength(0);
    expect(query(el, ".arrow")).toBeNull();
  });

  it("renders two Stories side by side, the first highlighted", async () => {
    const el = await mount();
    const carousel = query(el, ".carousel");

    expect(carousel?.getAttribute("data-layout")).toBe("pair");
    expect(carousel?.getAttribute("role")).toBe("region");
    expect(carousel?.getAttribute("aria-roledescription")).toBe("carrossel");
    expect(slides(el)).toHaveLength(2);
    expect(activeIndex(el)).toBe(0);
    expect(query(el, ".arrow-previous")).not.toBeNull();
    expect(query(el, ".arrow-next")).not.toBeNull();
  });

  // Covers have no alt text: the position tells the cards apart.
  it("names each card Watch or Show with its position", async () => {
    const el = await mount();
    const labels = () =>
      slides(el).map((slide) =>
        slide.querySelector(".card-open")?.getAttribute("aria-label"),
      );

    expect(labels()).toEqual(["Assistir vídeo 1 de 2", "Mostrar vídeo 2 de 2"]);

    await click(el, ".arrow-next");
    expect(labels()).toEqual(["Mostrar vídeo 1 de 2", "Assistir vídeo 2 de 2"]);
  });

  it("names a single Story's card without a position", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
    const el = await mount();

    expect(query(el, ".card-open")?.getAttribute("aria-label")).toBe(
      "Assistir vídeo",
    );
  });

  it("advances again after reloading with the pointer over it", async () => {
    const el = await mount();
    query(el, ".carousel")?.dispatchEvent(new PointerEvent("pointerenter"));

    // The carousel leaves the page while loading, without a pointerleave.
    el.setAttribute("placement", "other_stories");
    getRawAdsMock.mockResolvedValue(
      rawAdsWith([mockStory, secondStory], "other_stories"),
    );
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve));
    await el.updateComplete;
    vi.useFakeTimers();
    // The timer started with real timers: start it again, keeping the flags.
    await click(el, ".arrow-next");
    await click(el, ".arrow-previous");

    await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_MS);

    expect(activeIndex(el)).toBe(1);
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

  describe("call to action", () => {
    // A link destination: no product.
    const linkStory = mockStories[3];

    beforeEach(() => {
      getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory, linkStory]));
    });

    it("shows it instead of a product on a Story with a link", async () => {
      const el = await mount();
      const [productSlide, linkSlide] = slides(el);

      expect(productSlide.querySelector(".card-cta")).toBeNull();
      expect(linkSlide.querySelector(".card-product")).toBeNull();
      const link = linkSlide.querySelector<HTMLAnchorElement>(".card-cta");
      expect(link?.href).toBe(linkStory.destination_url);
      expect(link?.target).toBe("_blank");
      expect(link?.textContent?.trim()).toBe(linkStory.call_to_action);
    });

    it("shows none on a Story with a link but no text", async () => {
      getRawAdsMock.mockResolvedValue(
        rawAdsWith([mockStory, { ...linkStory, call_to_action: null }]),
      );
      const el = await mount();

      expect(query(el, ".card-cta")).toBeNull();
    });

    it("gives the highlight to its card instead of following the link", async () => {
      const el = await mount();
      const event = new MouseEvent("click", {
        bubbles: true,
        composed: true,
        cancelable: true,
      });

      query(el, ".slide:not([data-active]) .card-cta")?.dispatchEvent(event);
      await el.updateComplete;
      await el.updateComplete;

      expect(event.defaultPrevented).toBe(true);
      expect(activeIndex(el)).toBe(1);
      expect(query(el, ".player")).toBeNull();
    });

    it("follows the link on the highlighted card", async () => {
      const el = await mount();
      await click(el, ".arrow-next");
      let prevented: boolean | undefined;
      // After the element's listeners; cancels it so the test doesn't navigate.
      document.addEventListener(
        "click",
        (event) => {
          prevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );

      await click(el, ".slide[data-active] .card-cta");

      expect(prevented).toBe(false);
      expect(activeIndex(el)).toBe(1);
      expect(query(el, ".player")).toBeNull();
    });

    it("shows it in the player", async () => {
      const el = await mount();
      await click(el, ".arrow-next");

      await click(el, ".slide[data-active] .card-open");

      expect(query<HTMLAnchorElement>(el, ".player .card-cta")?.href).toBe(
        linkStory.destination_url,
      );
    });
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

      expect(query(el, ".carousel")?.getAttribute("data-layout")).toBe("solo");
    });
  });

  describe("sound", () => {
    // Lets the step render and the new card's video start.
    async function settle(el: VtexAdsStoryElement) {
      await el.updateComplete;
      await new Promise((resolve) => setTimeout(resolve));
      await el.updateComplete;
    }

    // As if the shopper turned the highlighted card's sound on.
    async function turnSoundOn(el: VtexAdsStoryElement, index = 0) {
      const video = slideVideo(el, index);
      video?.play();
      if (video) video.muted = false;
      video?.dispatchEvent(new Event("volumechange"));
      await el.updateComplete;
    }

    it("carries the sound on to the next highlighted card", async () => {
      const el = await mount();
      await turnSoundOn(el);

      query(el, ".arrow-next")?.click();
      await settle(el);

      const video = slideVideo(el, 1);
      expect(video?.muted).toBe(false);
      expect(video?.paused).toBe(false);
    });

    it("keeps the next card muted when the sound was off", async () => {
      const el = await mount();
      slideVideo(el, 0)?.play();

      query(el, ".arrow-next")?.click();
      await settle(el);

      expect(slideVideo(el, 1)?.muted).toBe(true);
    });

    it("plays muted when the browser blocks the sound", async () => {
      const el = await mount();
      await turnSoundOn(el);
      vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementationOnce(() =>
        Promise.reject(new DOMException("Blocked", "NotAllowedError")),
      );

      query(el, ".arrow-next")?.click();
      await settle(el);

      const video = slideVideo(el, 1);
      expect(video?.muted).toBe(true);
      expect(video?.paused).toBe(false);
    });

    // The highlight moved again, removing the video: the request fails for
    // that, not because the sound was blocked.
    it("does not retry muted when playing failed for another reason", async () => {
      const el = await mount();
      await turnSoundOn(el);
      const play = vi
        .spyOn(HTMLMediaElement.prototype, "play")
        .mockImplementationOnce(() =>
          Promise.reject(new DOMException("Removed", "AbortError")),
        );

      query(el, ".arrow-next")?.click();
      await settle(el);

      expect(play).toHaveBeenCalledTimes(1);
      expect(slideVideo(el, 1)?.paused).toBe(true);
      play.mockRestore();
    });

    it("carries the sound across steps taken before the first renders", async () => {
      getRawAdsMock.mockResolvedValue(
        rawAdsWith([mockStory, ...mockStories.slice(1, 3)]),
      );
      const el = await mount();
      const highlightedVideo = () =>
        query<HTMLVideoElement>(el, ".slide[data-active] video");
      highlightedVideo()?.play();
      const first = highlightedVideo();
      if (first) first.muted = false;
      first?.dispatchEvent(new Event("volumechange"));
      await el.updateComplete;

      query(el, ".arrow-next")?.click();
      query(el, ".arrow-next")?.click();
      await settle(el);

      expect(query(el, ".slide[data-active]")?.dataset.index).toBe("2");
      expect(highlightedVideo()?.muted).toBe(false);
    });

    it("mutes the card that keeps playing behind with inactive-autoplay", async () => {
      const el = await mount({
        ...REQUIRED_ATTRIBUTES,
        "inactive-autoplay": "",
      });
      await turnSoundOn(el);

      query(el, ".arrow-next")?.click();
      await settle(el);

      expect(slideVideo(el, 0)?.muted).toBe(true);
      expect(slideVideo(el, 1)?.muted).toBe(false);
    });
  });

  describe("player navigation", () => {
    const highlightedCard = (el: VtexAdsStoryElement) =>
      query(el, ".slide[data-active]");

    async function openPlayer(el: VtexAdsStoryElement) {
      await click(el, ".slide[data-active] .card-open");
    }

    it("has no previous and next with a single Story", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
      const el = await mount();
      await click(el, ".card-open");

      expect(query(el, ".player")).not.toBeNull();
      expect(query(el, ".player-nav")).toBeNull();
    });

    it("shows the next Story in the player and moves the highlight with it", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 3)));
      const el = await mount();
      await openPlayer(el);

      await click(el, ".player-next");
      await el.updateComplete;

      expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
        mockStories[1].poster_url,
      );
      expect(highlightedCard(el)?.dataset.index).toBe("1");
      expect(query<HTMLVideoElement>(el, ".player video")?.paused).toBe(false);
    });

    it("steps back past the first Story to the last", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 3)));
      const el = await mount();
      await openPlayer(el);

      await click(el, ".player-previous");

      expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
        mockStories[2].poster_url,
      );
      expect(highlightedCard(el)?.dataset.index).toBe("2");
    });

    // jsdom doesn't autoplay: this checks the new card's video is paused,
    // which in browsers also stops its autoplay.
    it("keeps the new highlighted card paused behind the player", async () => {
      const el = await mount();
      await openPlayer(el);
      const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");

      await click(el, ".player-next");
      await el.updateComplete;

      expect(pause.mock.contexts).toContain(slideVideo(el, 1));
      pause.mockRestore();
    });

    async function expandPlayer(el: VtexAdsStoryElement) {
      query(el, ".player-expand")?.click();
      await vi.waitFor(() =>
        expect(query(el, ".player")?.hasAttribute("data-expanded")).toBe(true),
      );
    }

    const neighborCovers = (el: VtexAdsStoryElement) =>
      [...(el.shadowRoot?.querySelectorAll(".player-neighbor img") ?? [])].map(
        (img) => img.getAttribute("src"),
      );

    it("shows the other Stories beside the expanded video", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 3)));
      const el = await mount();
      await openPlayer(el);

      await expandPlayer(el);

      expect(neighborCovers(el)).toEqual([
        mockStories[2].poster_url,
        mockStories[1].poster_url,
      ]);
      expect(
        [...(el.shadowRoot?.querySelectorAll(".player-neighbor") ?? [])].map(
          (cover) => cover.getAttribute("aria-label"),
        ),
      ).toEqual(["Mostrar vídeo 3 de 3", "Mostrar vídeo 2 de 3"]);
    });

    it("steps to the Story whose cover is clicked in the expanded view", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 4)));
      const el = await mount();
      await openPlayer(el);
      await expandPlayer(el);

      // The one two places before: the last.
      const farBefore = [
        ...(el.shadowRoot?.querySelectorAll<HTMLElement>(".player-neighbor") ??
          []),
      ].find((button) => button.style.getPropertyValue("--beyond") === "-1");
      farBefore?.click();
      await el.updateComplete;
      await el.updateComplete;

      expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
        mockStories[2].poster_url,
      );
      expect(highlightedCard(el)?.dataset.index).toBe("2");
    });

    it("moves on to the next Story when the expanded video ends", async () => {
      const el = await mount();
      await openPlayer(el);
      await expandPlayer(el);

      query(el, ".player video")?.dispatchEvent(new Event("ended"));
      await el.updateComplete;
      await el.updateComplete;

      expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
        secondStory.poster_url,
      );
      expect(highlightedCard(el)?.dataset.index).toBe("1");
    });

    it("steps with the arrow keys while the player is open", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 3)));
      const el = await mount();
      await openPlayer(el);

      // The close button has the focus when the player opens.
      query(el, ".player-close")?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowLeft",
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;
      await el.updateComplete;

      expect(query(el, ".player .poster")?.getAttribute("src")).toBe(
        mockStories[2].poster_url,
      );
      expect(highlightedCard(el)?.dataset.index).toBe("2");
    });

    it("plays the highlighted card again when the player closes", async () => {
      const el = await mount();
      await openPlayer(el);
      await click(el, ".player-next");
      await el.updateComplete;

      await click(el, ".player-close");

      expect(query(el, ".player")).toBeNull();
      expect(slideVideo(el, 1)?.paused).toBe(false);
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

    // React 18 writes boolean props as strings: `inactive-autoplay={false}`
    // arrives as "false", `{true}` as "true".
    it.each(["false", "FALSE", "yes", "1", " true "])(
      'stays off with inactive-autoplay="%s"',
      async (value) => {
        const el = await mount({
          ...REQUIRED_ATTRIBUTES,
          "inactive-autoplay": value,
        });

        expect(el.inactiveAutoplay).toBe(false);
        expect(slideVideo(el, 1)).toBeNull();
      },
    );

    it.each(["", "true", "TRUE"])(
      'turns on with inactive-autoplay="%s"',
      async (value) => {
        const el = await mount({
          ...REQUIRED_ATTRIBUTES,
          "inactive-autoplay": value,
        });

        expect(el.inactiveAutoplay).toBe(true);
        expect(slideVideo(el, 1)).not.toBeNull();
      },
    );

    it("turns off when the attribute is removed", async () => {
      const el = await mount({
        ...REQUIRED_ATTRIBUTES,
        "inactive-autoplay": "",
      });

      el.removeAttribute("inactive-autoplay");
      await el.updateComplete;

      expect(el.inactiveAutoplay).toBe(false);
      expect(slideVideo(el, 1)).toBeNull();
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

  describe("three or more Stories", () => {
    const storiesOf = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        ...mockStory,
        ad_id: `story-ad-${index}`,
        position: index,
      }));

    const visible = (el: VtexAdsStoryElement) =>
      slides(el).filter((slide) => !slide.hasAttribute("data-hidden"));

    // The Story index of each visible card, left to right.
    const visibleIndexes = (el: VtexAdsStoryElement) =>
      visible(el)
        .sort(
          (a, b) =>
            Number(a.style.getPropertyValue("--place")) -
            Number(b.style.getPropertyValue("--place")),
        )
        .map((slide) => Number(slide.dataset.index));

    const highlighted = (el: VtexAdsStoryElement) =>
      query(el, ".slide[data-active]");

    const atPlace = (el: VtexAdsStoryElement, place: number) =>
      visible(el).find(
        (slide) => slide.style.getPropertyValue("--place") === String(place),
      );

    async function mountWith(
      count: number,
      attributes: Record<string, string> = REQUIRED_ATTRIBUTES,
    ) {
      getRawAdsMock.mockResolvedValue(rawAdsWith(storiesOf(count)));
      return mount(attributes);
    }

    it("puts the highlighted Story in the middle, the others around it", async () => {
      const el = await mountWith(3);

      expect(query(el, ".carousel")?.getAttribute("data-layout")).toBe(
        "rolling",
      );
      expect(highlighted(el)?.dataset.index).toBe("0");
      expect(highlighted(el)?.style.getPropertyValue("--place")).toBe("0");
      expect(visibleIndexes(el)).toEqual([2, 0, 1]);
    });

    it("shows up to two cards on each side", async () => {
      const el = await mountWith(5);
      expect(visibleIndexes(el)).toEqual([3, 4, 0, 1, 2]);
    });

    it("shows the Story opposite the highlighted one at both ends with four", async () => {
      const el = await mountWith(4);
      expect(visibleIndexes(el)).toEqual([2, 3, 0, 1, 2]);
    });

    it("keeps hidden cards in the DOM, out of reach, so they slide in", async () => {
      const el = await mountWith(3);
      const hidden = slides(el).filter((slide) =>
        slide.hasAttribute("data-hidden"),
      );

      expect(slides(el)).toHaveLength(RENDERED_SIDE * 2 + 1);
      expect(hidden.every((slide) => slide.hasAttribute("inert"))).toBe(true);
      expect(visible(el).some((slide) => slide.hasAttribute("inert"))).toBe(
        false,
      );
    });

    it("moves every card one place with the arrows, keeping their DOM", async () => {
      const el = await mountWith(5);
      const next = atPlace(el, 1);

      await click(el, ".arrow-next");

      expect(highlighted(el)).toBe(next);
      expect(highlighted(el)?.dataset.index).toBe("1");
      expect(visibleIndexes(el)).toEqual([4, 0, 1, 2, 3]);

      await click(el, ".arrow-previous");
      await click(el, ".arrow-previous");
      expect(visibleIndexes(el)).toEqual([2, 3, 4, 0, 1]);
    });

    it("moves the clicked card to the middle", async () => {
      const el = await mountWith(5);

      atPlace(el, 2)?.querySelector<HTMLElement>(".card-open")?.click();
      await el.updateComplete;

      expect(highlighted(el)?.dataset.index).toBe("2");
      expect(query(el, ".player")).toBeNull();
    });

    it("opens the highlighted Story in the player", async () => {
      const el = await mountWith(3);
      await click(el, ".arrow-next");

      await click(el, ".slide[data-active] .card-open");

      expect(query(el, ".player")).not.toBeNull();
      expect(highlighted(el)?.dataset.index).toBe("1");
    });

    it("plays only the highlighted card by default", async () => {
      const el = await mountWith(5);
      const withVideo = slides(el).filter((slide) =>
        slide.querySelector("video"),
      );

      expect(withVideo).toEqual([highlighted(el)]);
    });

    it("plays the visible cards with inactive-autoplay, not the hidden ones", async () => {
      const el = await mountWith(5, {
        ...REQUIRED_ATTRIBUTES,
        "inactive-autoplay": "",
      });

      expect(visible(el).every((slide) => slide.querySelector("video"))).toBe(
        true,
      );
      expect(
        slides(el)
          .filter((slide) => slide.hasAttribute("data-hidden"))
          .some((slide) => slide.querySelector("video")),
      ).toBe(false);
    });

    it("moves the video with the highlight", async () => {
      const el = await mountWith(3);

      await click(el, ".arrow-next");

      const withVideo = slides(el).filter((slide) =>
        slide.querySelector("video"),
      );
      expect(withVideo).toEqual([highlighted(el)]);
    });
  });

  describe("narrow screens", () => {
    let listeners: ((event: MediaQueryListEvent) => void)[];
    let narrow: boolean;

    beforeEach(() => {
      listeners = [];
      narrow = true;
      vi.stubGlobal("matchMedia", (query: string) => ({
        get matches() {
          return query === NARROW_SCREEN.toString() && narrow;
        },
        addEventListener: (
          _type: string,
          listener: (event: MediaQueryListEvent) => void,
        ) => listeners.push(listener),
        removeEventListener: () => undefined,
      }));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("rolls two Stories, with the other one on both sides", async () => {
      const el = await mount();

      expect(query(el, ".carousel")?.getAttribute("data-layout")).toBe(
        "rolling",
      );
      const sides = slides(el)
        .filter((slide) => !slide.hasAttribute("data-hidden"))
        .map((slide) => slide.dataset.index);
      expect(sides.sort()).toEqual(["0", "1", "1"]);
    });

    // As if the screen got wide (or narrow, with `matches`).
    async function resize(el: VtexAdsStoryElement, matches = false) {
      narrow = matches;
      for (const listener of listeners) {
        listener({ matches } as MediaQueryListEvent);
      }
      await el.updateComplete;
      await el.updateComplete;
    }

    it("renders new cards, with new videos, when the layout changes", async () => {
      const el = await mount();
      const before = query<HTMLVideoElement>(el, ".slide[data-active] video");

      await resize(el);

      const after = query<HTMLVideoElement>(el, ".slide[data-active] video");
      expect(after).not.toBeNull();
      expect(after).not.toBe(before);
    });

    // jsdom doesn't autoplay: this checks the new card's video is paused,
    // which in browsers also stops its autoplay.
    it("keeps the new highlighted card paused behind an open player", async () => {
      const el = await mount();
      await click(el, ".slide[data-active] .card-open");
      const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");

      await resize(el);

      expect(pause.mock.contexts).toContain(
        query(el, ".slide[data-active] video"),
      );
      pause.mockRestore();
    });

    it("switches to the pair layout when the screen gets wide", async () => {
      const el = await mount();

      narrow = false;
      for (const listener of listeners) {
        listener({ matches: false } as MediaQueryListEvent);
      }
      await el.updateComplete;

      expect(query(el, ".carousel")?.getAttribute("data-layout")).toBe("pair");
      expect(slides(el)).toHaveLength(2);
      expect(slideVideo(el, 0)).not.toBeNull();
    });
  });
});

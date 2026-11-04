import {
  describe,
  it,
  expect,
  expectTypeOf,
  beforeAll,
  afterEach,
} from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";

// The fixed test Story in story.ts.
const COVER = "https://dummyimage.com/1080x1920/e31c57/fff";
const VIDEO = "https://samplelib.com/mp4/sample-10s-vp9.mp4";

async function mount() {
  const el = document.createElement(TAG_NAME);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// Lets the element render, and the player show after it renders.
async function settle(el: VtexAdsStoryElement) {
  await el.updateComplete;
  await el.updateComplete;
}

describe("vtex-ads-story", () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStories();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("registers the custom element", () => {
    expect(customElements.get(TAG_NAME)).toBe(VtexAdsStoryElement);
  });

  it("types the tag as VtexAdsStoryElement in the DOM", () => {
    const el = document.createElement("vtex-ads-story");
    expect(el).toBeInstanceOf(VtexAdsStoryElement);
    expectTypeOf(el).toEqualTypeOf<VtexAdsStoryElement>();
    expectTypeOf(
      document.querySelector("vtex-ads-story"),
    ).toEqualTypeOf<VtexAdsStoryElement | null>();
  });

  it("does not throw when defined twice", () => {
    expect(() => defineVtexAdsStories()).not.toThrow();
  });

  it("renders one card", async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelectorAll(".card")).toHaveLength(1);
  });

  it("renders the test Story's cover and video", async () => {
    const el = await mount();
    const card = el.shadowRoot?.querySelector(".card");

    expect(card?.querySelector(".poster")?.getAttribute("src")).toBe(COVER);
    expect(card?.querySelector("video")?.getAttribute("src")).toBe(VIDEO);
  });

  it("renders the card only once when connected again", async () => {
    const el = await mount();
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll(".card")).toHaveLength(1);
  });

  it("plays the card video again when the element is moved", async () => {
    const el = await mount();
    const video =
      el.shadowRoot?.querySelector<HTMLVideoElement>(".root .card video");
    video?.play();

    el.remove();
    // Browsers pause a video removed from the page; jsdom doesn't.
    video?.pause();
    document.body.appendChild(el);
    await el.updateComplete;

    expect(video?.paused).toBe(false);
  });

  describe("player", () => {
    // The card's button, which opens the player.
    function getCard(el: Element) {
      return el.shadowRoot?.querySelector<HTMLElement>(".root .card-open");
    }

    function getPlayers(el: Element) {
      return el.shadowRoot?.querySelectorAll(".player") ?? [];
    }

    it("opens the same Story in the player when the card is clicked", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);

      const players = getPlayers(el);
      expect(players).toHaveLength(1);
      expect(players[0].querySelector(".poster")?.getAttribute("src")).toBe(
        COVER,
      );
    });

    it("opens the player only once", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      getCard(el)?.click();
      await settle(el);

      expect(getPlayers(el)).toHaveLength(1);
    });

    it("focuses the close button when the player opens", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);

      expect(el.shadowRoot?.activeElement?.getAttribute("aria-label")).toBe(
        "Fechar vídeo",
      );
    });

    function getVideos(el: Element) {
      return {
        card: el.shadowRoot?.querySelector<HTMLVideoElement>(
          ".root .card video",
        ),
        player: el.shadowRoot?.querySelector<HTMLVideoElement>(".player video"),
      };
    }

    it("pauses the card video and plays the player's while open", async () => {
      const el = await mount();
      getVideos(el).card?.play();
      getCard(el)?.click();
      await settle(el);

      const { card, player } = getVideos(el);
      expect(card?.paused).toBe(true);
      expect(player?.paused).toBe(false);
      expect(player?.muted).toBe(true);
    });

    it("plays the card video again when the player closes", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();
      await settle(el);

      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("plays the card video again when the player closes with Escape", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await settle(el);

      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("plays the card video again when the expanded backdrop is clicked", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-expand")?.click();
      await settle(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player")?.click();
      await settle(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("closes from the close button and focuses the card again", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();
      await settle(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(el.shadowRoot?.activeElement).toBe(getCard(el));
    });

    it("closes on Escape", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await settle(el);

      expect(getPlayers(el)).toHaveLength(0);
    });

    it("does not resume the card video when the element is removed", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      expect(getVideos(el).card?.paused).toBe(true);

      el.remove();
      await settle(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(getVideos(el).card?.paused).toBe(true);
    });

    it("closes when the element is removed", async () => {
      const el = await mount();
      getCard(el)?.click();
      await settle(el);
      el.remove();
      await settle(el);

      expect(getPlayers(el)).toHaveLength(0);
    });
  });
});

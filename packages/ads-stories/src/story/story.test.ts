import {
  describe,
  it,
  expect,
  expectTypeOf,
  beforeAll,
  afterEach,
} from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";
import { installMediaMocks } from "../components/card/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";

// The fixed test Story in story.ts.
const COVER = "https://dummyimage.com/1080x1920/e31c57/fff";
const VIDEO = "https://samplelib.com/mp4/sample-10s-vp9.mp4";

function mount() {
  const el = document.createElement(TAG_NAME);
  document.body.appendChild(el);
  return el;
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

  it("renders one card", () => {
    const el = mount();
    expect(el.shadowRoot?.querySelectorAll(".card")).toHaveLength(1);
  });

  it("renders the test Story's cover and video", () => {
    const el = mount();
    const card = el.shadowRoot?.querySelector(".card");

    expect(card?.querySelector(".poster")?.getAttribute("src")).toBe(COVER);
    expect(card?.querySelector("video")?.getAttribute("src")).toBe(VIDEO);
  });

  it("renders the card only once when connected again", () => {
    const el = mount();
    el.remove();
    document.body.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll(".card")).toHaveLength(1);
  });

  describe("player", () => {
    function getCard(el: Element) {
      return el.shadowRoot?.querySelector<HTMLElement>(".root .card");
    }

    function getPlayers(el: Element) {
      return el.shadowRoot?.querySelectorAll(".player") ?? [];
    }

    it("opens the same Story in the player when the card is clicked", () => {
      const el = mount();
      getCard(el)?.click();

      const players = getPlayers(el);
      expect(players).toHaveLength(1);
      expect(players[0].querySelector(".poster")?.getAttribute("src")).toBe(
        COVER,
      );
    });

    it.each(["Enter", " "])(
      "opens the player when %j is pressed on the card",
      (key) => {
        const el = mount();
        getCard(el)?.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true }),
        );

        expect(getPlayers(el)).toHaveLength(1);
      },
    );

    it("opens the player only once", () => {
      const el = mount();
      getCard(el)?.click();
      getCard(el)?.click();

      expect(getPlayers(el)).toHaveLength(1);
    });

    it("focuses the close button when the player opens", () => {
      const el = mount();
      getCard(el)?.click();

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

    it("pauses the card video and plays the player's while open", () => {
      const el = mount();
      getVideos(el).card?.play();
      getCard(el)?.click();

      const { card, player } = getVideos(el);
      expect(card?.paused).toBe(true);
      expect(player?.paused).toBe(false);
      expect(player?.muted).toBe(true);
    });

    it("plays the card video again when the player closes", () => {
      const el = mount();
      getCard(el)?.click();
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();

      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("closes from the close button and focuses the card again", () => {
      const el = mount();
      getCard(el)?.click();
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();

      expect(getPlayers(el)).toHaveLength(0);
      expect(el.shadowRoot?.activeElement).toBe(getCard(el));
    });

    it("closes on Escape", () => {
      const el = mount();
      getCard(el)?.click();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

      expect(getPlayers(el)).toHaveLength(0);
    });

    it("closes when the element is removed", () => {
      const el = mount();
      getCard(el)?.click();
      el.remove();

      expect(getPlayers(el)).toHaveLength(0);
    });
  });
});

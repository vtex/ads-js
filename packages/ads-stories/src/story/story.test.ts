import {
  describe,
  it,
  expect,
  expectTypeOf,
  beforeAll,
  afterEach,
} from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";

function mount() {
  const el = document.createElement(TAG_NAME);
  document.body.appendChild(el);
  return el;
}

describe("vtex-ads-story", () => {
  beforeAll(() => {
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

  it("renders the placeholder cover", () => {
    const el = mount();
    const poster = el.shadowRoot?.querySelector<HTMLImageElement>(".poster");
    expect(poster?.src).toBe("https://dummyimage.com/1080x1920/e31c57/fff");
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
        "https://dummyimage.com/1080x1920/e31c57/fff",
      );
    });

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

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
});

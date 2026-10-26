// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./element";

describe("vtex-ads-story", () => {
  beforeAll(() => {
    defineVtexAdsStories();
  });

  it("registers the custom element", () => {
    expect(customElements.get(TAG_NAME)).toBe(VtexAdsStoryElement);
  });

  it("does not throw when defined twice", () => {
    expect(() => defineVtexAdsStories()).not.toThrow();
  });

  it("renders hello world inside the shadow root", () => {
    const el = document.createElement(TAG_NAME);
    document.body.appendChild(el);

    const root = el.shadowRoot?.querySelector("[part='root']");
    expect(root?.textContent).toBe("Hello world");

    el.remove();
  });
});

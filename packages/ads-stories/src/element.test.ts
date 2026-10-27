import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./element";

function mount(attributes: Record<string, string> = {}) {
  const el = document.createElement(TAG_NAME);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  document.body.appendChild(el);
  return el;
}

function getText(el: Element) {
  return el.shadowRoot?.querySelector("[part='root']")?.textContent;
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

  it("does not throw when defined twice", () => {
    expect(() => defineVtexAdsStories()).not.toThrow();
  });

  it("renders hello world when no name is given", () => {
    const el = mount();
    expect(getText(el)).toBe("Hello world!");
  });

  it("renders the name attribute", () => {
    const el = mount({ name: "VTEX" });
    expect(getText(el)).toBe("Hello VTEX!");
  });

  it("updates when the name changes", () => {
    const el = mount({ name: "VTEX" });

    el.setAttribute("name", "Ads");
    expect(getText(el)).toBe("Hello Ads!");

    (el as VtexAdsStoryElement).name = "Stories";
    expect(el.getAttribute("name")).toBe("Stories");
    expect(getText(el)).toBe("Hello Stories!");

    el.removeAttribute("name");
    expect(getText(el)).toBe("Hello world!");
  });

  it("falls back to world when the name is blank", () => {
    const el = mount({ name: "   " });
    expect(getText(el)).toBe("Hello world!");
  });

  it("renders the name as text, not HTML", () => {
    const el = mount({ name: "<b>bold</b>" });
    expect(getText(el)).toBe("Hello <b>bold</b>!");
    expect(el.shadowRoot?.querySelector("b")).toBeNull();
  });
});

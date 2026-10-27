import { describe, it, expect } from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";

// Separate file: the element must not be defined yet when the test starts,
// and a custom element can't be undefined once registered.
describe("vtex-ads-story before definition", () => {
  it("keeps a name set before the element was defined", () => {
    const el = document.createElement(TAG_NAME) as VtexAdsStoryElement;
    el.name = "Early";
    document.body.appendChild(el);

    defineVtexAdsStories();

    expect(el.shadowRoot?.textContent).toContain("Hello Early!");
    expect(el.getAttribute("name")).toBe("Early");

    el.name = "Later";
    expect(el.getAttribute("name")).toBe("Later");
    expect(el.shadowRoot?.textContent).toContain("Hello Later!");

    el.setAttribute("name", "Attribute");
    expect(el.name).toBe("Attribute");
    expect(el.shadowRoot?.textContent).toContain("Hello Attribute!");
  });
});

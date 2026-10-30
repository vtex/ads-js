import { describe, it, expect, beforeAll } from "vitest";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";
import { installDialogMocks } from "../components/player/dialog.mock";

// Separate file: the element must not be defined yet when the test starts,
// and a custom element can't be undefined once registered.
describe("vtex-ads-story before definition", () => {
  beforeAll(() => {
    installDialogMocks();
  });

  it("renders an element that was in the page before it was defined", () => {
    // As with the CDN script, when the HTML is parsed before the script runs.
    document.body.innerHTML = `<${TAG_NAME}></${TAG_NAME}>`;
    const el = document.querySelector(TAG_NAME);
    expect(el?.shadowRoot).toBeNull();

    defineVtexAdsStories();

    expect(el).toBeInstanceOf(VtexAdsStoryElement);
    const card = el?.shadowRoot?.querySelector<HTMLElement>(".root .card");
    expect(card).toBeTruthy();

    card?.click();
    expect(el?.shadowRoot?.querySelectorAll(".player")).toHaveLength(1);
  });
});

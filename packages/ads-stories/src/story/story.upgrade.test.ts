import { describe, it, expect, beforeAll, vi } from "vitest";
import { getRawAds } from "@vtex/ads-core";
import {
  defineVtexAdsStoryCarousel,
  TAG_NAME,
  VtexAdsStoryCarouselElement,
} from "./story";
import { mockStory, rawAdsWith } from "./story.mock";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";

vi.mock("@vtex/ads-core", () => ({
  getRawAds: vi.fn(),
  hydrateAds: vi.fn(),
  intelligentSearchFetcher: vi.fn(),
  intelligentSearchMatcher: vi.fn(),
  intelligentSearchPrice: vi.fn(),
  intelligentSearchAvailability: vi.fn(),
}));

// Separate file: the element must not be defined yet when the test starts,
// and a custom element can't be undefined once registered.
describe(`${TAG_NAME} before definition`, () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    vi.mocked(getRawAds).mockResolvedValue(rawAdsWith([mockStory]));
  });

  it("renders an element that was in the page before it was defined", async () => {
    // As with the CDN script, when the HTML is parsed before the script runs.
    document.body.innerHTML = `<${TAG_NAME} publisher-id="publisher-1" session-id="session-1" placement="home_stories"></${TAG_NAME}>`;
    const el = document.querySelector(TAG_NAME);
    expect(el?.shadowRoot).toBeNull();

    defineVtexAdsStoryCarousel();

    expect(el).toBeInstanceOf(VtexAdsStoryCarouselElement);
    await el?.updateComplete;
    // Lets the ad request resolve and the element render the Story.
    await new Promise((resolve) => setTimeout(resolve));
    await el?.updateComplete;
    const card = el?.shadowRoot?.querySelector<HTMLElement>(".root .card-open");
    expect(card).toBeTruthy();

    card?.click();
    await el?.updateComplete;
    expect(el?.shadowRoot?.querySelectorAll(".player")).toHaveLength(1);
  });
});

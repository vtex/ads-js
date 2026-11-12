import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { getRawAds, type RawAdsResponse } from "@vtex/ads-core";
import {
  defineVtexAdsStoryCarousel,
  TAG_NAME,
  type VtexAdsStoryCarouselElement,
} from "./story";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";
import { MEDIA_TIMEOUT } from "../utils/preload-images";
import { mockStories, rawAdsWith, REQUIRED_ATTRIBUTES } from "./story.mock";

vi.mock("@vtex/ads-core", () => ({
  getRawAds: vi.fn(),
  hydrateAds: vi.fn(),
  intelligentSearchFetcher: vi.fn(),
  intelligentSearchMatcher: vi.fn(),
  intelligentSearchPrice: vi.fn(),
  intelligentSearchAvailability: vi.fn(),
}));

const getRawAdsMock = vi.mocked(getRawAds);

// Images that decode only when the test says so, by URL.
const pending = new Map<string, { resolve: () => void; reject: () => void }>();
const requested: string[] = [];

class FakeImage {
  src = "";
  decode() {
    requested.push(this.src);
    return new Promise<void>((resolve, reject) => {
      pending.set(this.src, { resolve, reject: () => reject(new Error()) });
    });
  }
}

function deferred() {
  let resolve!: (value: RawAdsResponse) => void;
  const promise = new Promise<RawAdsResponse>((r) => (resolve = r));
  return { promise, resolve };
}

const root = (el: VtexAdsStoryCarouselElement) =>
  el.shadowRoot?.querySelector<HTMLElement>(".root");
const skeleton = (el: VtexAdsStoryCarouselElement) =>
  el.shadowRoot?.querySelector<HTMLElement>(".skeleton");

async function settle(el: VtexAdsStoryCarouselElement) {
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
}

async function mount() {
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(REQUIRED_ATTRIBUTES)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  await settle(el);
  return el;
}

const decodeAll = () => {
  for (const { resolve } of pending.values()) resolve();
};

describe(`${TAG_NAME} media loading`, () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStoryCarousel();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("Image", FakeImage);
    pending.clear();
    requested.length = 0;
    getRawAdsMock.mockReset();
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStories[0]]));
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows the skeleton while the request is pending", async () => {
    const response = deferred();
    getRawAdsMock.mockReturnValue(response.promise);
    const el = await mount();

    expect(root(el)?.hasAttribute("data-requesting")).toBe(true);
    expect(skeleton(el)?.hasAttribute("data-done")).toBe(false);
    expect(el.shadowRoot?.querySelector(".carousel")).toBeNull();

    response.resolve(rawAdsWith([mockStories[0]]));
    await settle(el);

    expect(root(el)?.hasAttribute("data-requesting")).toBe(false);
    expect(root(el)?.hasAttribute("data-loading")).toBe(true);
    expect(skeleton(el)?.hasAttribute("data-done")).toBe(false);
  });

  it("keeps the same skeleton from the request to the media", async () => {
    const response = deferred();
    getRawAdsMock.mockReturnValue(response.promise);
    const el = await mount();
    const first = skeleton(el);

    response.resolve(rawAdsWith([mockStories[0]]));
    await settle(el);

    expect(skeleton(el)).toBe(first);
  });

  it("removes the skeleton when the request fails", async () => {
    getRawAdsMock.mockRejectedValue(new Error("Ad server error"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const el = await mount();
    consoleError.mockRestore();

    expect(root(el)).toBeNull();
  });

  it("shows no skeleton, and requests nothing, without a required attribute", async () => {
    const el = document.createElement(TAG_NAME);
    el.setAttribute("publisher-id", "publisher-1");
    document.body.appendChild(el);
    await settle(el);

    expect(getRawAdsMock).not.toHaveBeenCalled();
    expect(root(el)).toBeNull();
  });

  it("covers the cards with a skeleton until the images are ready", async () => {
    const el = await mount();

    expect(root(el)?.hasAttribute("data-loading")).toBe(true);
    expect(skeleton(el)?.hasAttribute("data-done")).toBe(false);
    expect(skeleton(el)?.getAttribute("aria-hidden")).toBe("true");

    decodeAll();
    await settle(el);

    expect(root(el)?.hasAttribute("data-loading")).toBe(false);
    expect(skeleton(el)?.hasAttribute("data-done")).toBe(true);
  });

  it("waits only for the first Story's cover", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 2)));
    await mount();

    expect(requested).toEqual([mockStories[0].poster_url]);
  });

  it("doesn't wait when the cover isn't an http(s) URL", async () => {
    getRawAdsMock.mockResolvedValue(
      rawAdsWith([{ ...mockStories[0], poster_url: "javascript:alert(1)" }]),
    );
    const el = await mount();

    expect(requested).toEqual([]);
    expect(root(el)?.hasAttribute("data-loading")).toBe(false);
  });

  it("shows the cards once a broken image fails", async () => {
    const el = await mount();

    for (const { reject } of pending.values()) reject();
    await settle(el);

    expect(root(el)?.hasAttribute("data-loading")).toBe(false);
  });

  it("shows the cards after the time limit", async () => {
    const el = await mount();

    await vi.advanceTimersByTimeAsync(MEDIA_TIMEOUT);
    await el.updateComplete;

    expect(root(el)?.hasAttribute("data-loading")).toBe(false);
  });

  it("draws one placeholder card for a single Story", async () => {
    const el = await mount();

    expect(skeleton(el)?.hasAttribute("data-solo")).toBe(true);
    expect(skeleton(el)?.querySelectorAll(".skeleton-card")).toHaveLength(1);
  });

  it("draws the rolling layout's placeholders for several Stories", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith(mockStories.slice(0, 3)));
    const el = await mount();

    expect(skeleton(el)?.hasAttribute("data-solo")).toBe(false);
    expect(skeleton(el)?.querySelectorAll(".skeleton-card")).toHaveLength(5);
  });

  it("doesn't show a skeleton when there are no images", async () => {
    getRawAdsMock.mockResolvedValue(
      rawAdsWith([{ ...mockStories[3], poster_url: "" }]),
    );
    const el = await mount();

    expect(root(el)?.hasAttribute("data-loading")).toBe(false);
  });

  it("ignores the images of Stories already replaced", async () => {
    const el = await mount();
    const stale = new Map(pending);

    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStories[1]], "other"));
    el.setAttribute("placement", "other");
    await settle(el);
    pending.clear();

    for (const { resolve } of stale.values()) resolve();
    await settle(el);

    expect(root(el)?.hasAttribute("data-loading")).toBe(true);
  });
});

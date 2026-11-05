import {
  describe,
  it,
  expect,
  expectTypeOf,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { getRawAds, type RawAdsResponse } from "@vtex/ads-core";
import { defineVtexAdsStories, TAG_NAME, VtexAdsStoryElement } from "./story";
import { installMediaMocks } from "../components/media/media.mock";
import { installDialogMocks } from "../components/player/dialog.mock";
import { mockStory, rawAdsWith, REQUIRED_ATTRIBUTES } from "./story.mock";

vi.mock("@vtex/ads-core", () => ({ getRawAds: vi.fn() }));

const getRawAdsMock = vi.mocked(getRawAds);

const COVER = mockStory.poster_url;
const VIDEO = mockStory.media_url;

// Lets the ad request resolve and the element render its result. Use it after
// anything that requests a Story (mounting, changing a request attribute).
async function flushRequest(el: VtexAdsStoryElement) {
  await el.updateComplete;
  await new Promise((resolve) => setTimeout(resolve));
  await el.updateComplete;
}

async function mount(attributes: Record<string, string> = REQUIRED_ATTRIBUTES) {
  const el = document.createElement(TAG_NAME);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  await flushRequest(el);
  return el;
}

// A response that resolves only when the test says so.
function deferred() {
  let resolve!: (value: RawAdsResponse) => void;
  const promise = new Promise<RawAdsResponse>((r) => (resolve = r));
  return { promise, resolve };
}

// Lets the element render, and the player show after it renders. Does not wait
// for an ad request: use flushRequest for that.
async function flushRender(el: VtexAdsStoryElement) {
  await el.updateComplete;
  await el.updateComplete;
}

describe("vtex-ads-story", () => {
  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
    defineVtexAdsStories();
  });

  beforeEach(() => {
    getRawAdsMock.mockReset();
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));
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

  it("renders the Story's cover and video", async () => {
    const el = await mount();
    const card = el.shadowRoot?.querySelector(".card");

    expect(card?.querySelector(".poster")?.getAttribute("src")).toBe(COVER);
    expect(card?.querySelector("video")?.getAttribute("src")).toBe(VIDEO);
  });

  describe("ad request", () => {
    it("requests one Story for the placement", async () => {
      await mount();

      expect(getRawAdsMock).toHaveBeenCalledTimes(1);
      expect(getRawAdsMock).toHaveBeenCalledWith(
        {
          identity: {
            accountName: "",
            publisherId: "publisher-1",
            sessionId: "session-1",
            userId: undefined,
            channel: undefined,
          },
          search: {},
          placements: { home_stories: { quantity: 1, types: ["story"] } },
        },
        { signal: expect.any(AbortSignal) },
      );
    });

    it("sends the optional attributes", async () => {
      await mount({
        ...REQUIRED_ATTRIBUTES,
        "user-id": "user-1",
        "account-name": "store",
        channel: "app",
      });

      expect(getRawAdsMock.mock.calls[0][0].identity).toEqual({
        accountName: "store",
        publisherId: "publisher-1",
        sessionId: "session-1",
        userId: "user-1",
        channel: "app",
      });
    });

    it("passes the timeout attribute as a number", async () => {
      await mount({ ...REQUIRED_ATTRIBUTES, timeout: "5000" });

      expect(getRawAdsMock).toHaveBeenCalledTimes(1);
      // fetchStory reads it; the element only forwards the property.
      expect(
        document.querySelector<VtexAdsStoryElement>(TAG_NAME)?.timeout,
      ).toBe(5000);
    });

    it("cancels the request after the timeout attribute, not the default", async () => {
      vi.useFakeTimers();
      try {
        getRawAdsMock.mockReturnValue(deferred().promise);
        const el = document.createElement(TAG_NAME);
        for (const [name, value] of Object.entries({
          ...REQUIRED_ATTRIBUTES,
          timeout: "5000",
        })) {
          el.setAttribute(name, value);
        }
        document.body.appendChild(el);
        await el.updateComplete;

        const signal = getRawAdsMock.mock.calls[0][1]?.signal;
        expect(signal?.aborted).toBe(false);

        // Past the 2 s default: still pending.
        await vi.advanceTimersByTimeAsync(2000);
        expect(signal?.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(3000);
        expect(signal?.aborted).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("does not request again when only the timeout changes", async () => {
      const el = await mount();

      el.setAttribute("timeout", "5000");
      await flushRequest(el);

      expect(getRawAdsMock).toHaveBeenCalledTimes(1);
    });

    it("does not send an unknown channel", async () => {
      await mount({ ...REQUIRED_ATTRIBUTES, channel: "tv" });

      expect(getRawAdsMock.mock.calls[0][0].identity.channel).toBeUndefined();
    });

    it.each(Object.keys(REQUIRED_ATTRIBUTES))(
      "renders nothing and does not request without %s",
      async (missing) => {
        const attributes = { ...REQUIRED_ATTRIBUTES };
        delete attributes[missing as keyof typeof attributes];
        const el = await mount(attributes);

        expect(getRawAdsMock).not.toHaveBeenCalled();
        expect(el.shadowRoot?.querySelector(".root")).toBeNull();
      },
    );

    it("renders nothing when the request fails", async () => {
      getRawAdsMock.mockRejectedValue(new Error("Ad server error"));
      // fetchStory logs the failure.
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const el = await mount();

      expect(el.shadowRoot?.querySelector(".card")).toBeNull();
      consoleError.mockRestore();
    });

    it("renders nothing when the placement has no Story", async () => {
      getRawAdsMock.mockResolvedValue(rawAdsWith([]));
      const el = await mount();

      expect(el.shadowRoot?.querySelector(".card")).toBeNull();
    });

    it("renders nothing when the response misses the placement", async () => {
      getRawAdsMock.mockResolvedValue({
        ...rawAdsWith([]),
        stories: { other_placement: [mockStory] },
      });
      const el = await mount();

      expect(el.shadowRoot?.querySelector(".card")).toBeNull();
    });

    it("renders nothing while the request is pending", async () => {
      getRawAdsMock.mockReturnValue(deferred().promise);
      const el = await mount();

      expect(el.shadowRoot?.querySelector(".card")).toBeNull();
    });

    it("requests again when an attribute changes", async () => {
      const el = await mount();
      const other = { ...mockStory, poster_url: "https://cdn.example/2.jpg" };
      getRawAdsMock.mockResolvedValue(rawAdsWith([other], "other_stories"));

      el.setAttribute("placement", "other_stories");
      await flushRequest(el);

      expect(getRawAdsMock).toHaveBeenCalledTimes(2);
      expect(el.shadowRoot?.querySelector(".poster")?.getAttribute("src")).toBe(
        other.poster_url,
      );
    });

    it("ignores a response to an earlier request", async () => {
      const first = deferred();
      const second = deferred();
      getRawAdsMock
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);

      const el = await mount();
      el.setAttribute("session-id", "session-2");
      await flushRequest(el);

      const latest = { ...mockStory, poster_url: "https://cdn.example/2.jpg" };
      second.resolve(rawAdsWith([latest]));
      await flushRequest(el);
      first.resolve(rawAdsWith([mockStory]));
      await flushRequest(el);

      expect(el.shadowRoot?.querySelector(".poster")?.getAttribute("src")).toBe(
        latest.poster_url,
      );
    });

    // The AbortSignal the element passed to its nth getRawAds call.
    const signalOf = (call: number) =>
      getRawAdsMock.mock.calls[call][1]?.signal;

    it("cancels a pending request when an attribute changes", async () => {
      getRawAdsMock.mockReturnValue(deferred().promise);
      const el = await mount();

      el.setAttribute("session-id", "session-2");
      await flushRequest(el);

      expect(signalOf(0)?.aborted).toBe(true);
      expect(signalOf(1)?.aborted).toBe(false);
    });

    it("cancels a pending request when the element is removed", async () => {
      getRawAdsMock.mockReturnValue(deferred().promise);
      const el = await mount();

      el.remove();

      expect(signalOf(0)?.aborted).toBe(true);
    });

    it("requests again when moved while its request was pending", async () => {
      getRawAdsMock.mockReturnValueOnce(deferred().promise);
      const el = await mount();

      el.remove();
      document.body.appendChild(el);
      await flushRequest(el);

      expect(getRawAdsMock).toHaveBeenCalledTimes(2);
      expect(el.shadowRoot?.querySelector(".card")).not.toBeNull();
    });

    it("does not request while removed right after an attribute change", async () => {
      const el = await mount();

      // The change is applied by Lit's next update, after the removal.
      el.setAttribute("placement", "other_stories");
      el.remove();
      await el.updateComplete;

      expect(getRawAdsMock).toHaveBeenCalledTimes(1);

      document.body.appendChild(el);
      await flushRequest(el);

      expect(getRawAdsMock).toHaveBeenCalledTimes(2);
      expect(getRawAdsMock.mock.calls[1][0].placements).toHaveProperty(
        "other_stories",
      );
    });

    it("shows the next Story's video after the previous one failed to load", async () => {
      const el = await mount();
      el.shadowRoot
        ?.querySelector(".card video")
        ?.dispatchEvent(new Event("error"));
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector(".card video")).toBeNull();

      getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory], "other_stories"));
      el.setAttribute("placement", "other_stories");
      await flushRequest(el);

      expect(el.shadowRoot?.querySelector(".card video")).not.toBeNull();
    });

    it("does not request again when moved after the Story loaded", async () => {
      const el = await mount();

      el.remove();
      document.body.appendChild(el);
      await flushRequest(el);

      expect(getRawAdsMock).toHaveBeenCalledTimes(1);
      expect(signalOf(0)?.aborted).toBe(false);
    });
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
      await flushRender(el);

      const players = getPlayers(el);
      expect(players).toHaveLength(1);
      expect(players[0].querySelector(".poster")?.getAttribute("src")).toBe(
        COVER,
      );
    });

    it("opens the player only once", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      getCard(el)?.click();
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(1);
    });

    it("focuses the close button when the player opens", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);

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
      await flushRender(el);

      const { card, player } = getVideos(el);
      expect(card?.paused).toBe(true);
      expect(player?.paused).toBe(false);
      expect(player?.muted).toBe(true);
    });

    it("plays the card video again when the player closes", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();
      await flushRender(el);

      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("plays the card video again when the player closes with Escape", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushRender(el);

      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("plays the card video again when the expanded backdrop is clicked", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-expand")?.click();
      await flushRender(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player")?.click();
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(getVideos(el).card?.paused).toBe(false);
    });

    it("closes from the close button and focuses the card again", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      el.shadowRoot?.querySelector<HTMLElement>(".player-close")?.click();
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(el.shadowRoot?.activeElement).toBe(getCard(el));
    });

    it("closes on Escape", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(0);
    });

    it("does not resume the card video when the element is removed", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      expect(getVideos(el).card?.paused).toBe(true);

      el.remove();
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(0);
      expect(getVideos(el).card?.paused).toBe(true);
    });

    it("closes when an attribute changes", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      getRawAdsMock.mockReturnValue(deferred().promise);

      el.setAttribute("session-id", "session-2");
      await flushRequest(el);

      expect(getPlayers(el)).toHaveLength(0);
    });

    it("closes when the element is removed", async () => {
      const el = await mount();
      getCard(el)?.click();
      await flushRender(el);
      el.remove();
      await flushRender(el);

      expect(getPlayers(el)).toHaveLength(0);
    });
  });
});

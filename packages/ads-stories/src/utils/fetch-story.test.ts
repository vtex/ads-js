import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRawAds, type RawAdsResponse } from "@vtex/ads-core";
import {
  DEFAULT_QUANTITY,
  DEFAULT_TIMEOUT_MS,
  fetchStories,
} from "./fetch-story";
import { mockStory, rawAdsWith } from "../story/story.mock";
import { TAG_NAME } from "../tag-name";

vi.mock("@vtex/ads-core", () => ({ getRawAds: vi.fn() }));

const getRawAdsMock = vi.mocked(getRawAds);

const REQUEST = {
  publisherId: "publisher-1",
  sessionId: "session-1",
  placement: "home_stories",
};

// Settles only when the request's signal aborts, like a hanging fetch.
function hangUntilAborted() {
  getRawAdsMock.mockImplementation(
    (_args, options) =>
      new Promise<RawAdsResponse>((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () =>
          reject(options.signal?.reason),
        );
      }),
  );
}

const signalOfFirstCall = () => getRawAdsMock.mock.calls[0][1]?.signal;

describe("fetchStories", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getRawAdsMock.mockReset();
    vi.useFakeTimers();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleError.mockRestore();
  });

  it("resolves to the Stories of the placement", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

    await expect(fetchStories(REQUEST)).resolves.toEqual([mockStory]);
  });

  const storiesOf = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      ...mockStory,
      ad_id: `story-ad-${index}`,
    }));

  const requestedQuantity = () =>
    getRawAdsMock.mock.calls[0][0].placements.home_stories.quantity;

  it(`requests ${DEFAULT_QUANTITY} Stories by default and keeps no more`, async () => {
    const stories = storiesOf(DEFAULT_QUANTITY + 1);
    getRawAdsMock.mockResolvedValue(rawAdsWith(stories));

    await expect(fetchStories(REQUEST)).resolves.toEqual(
      stories.slice(0, DEFAULT_QUANTITY),
    );
    expect(getRawAdsMock.mock.calls[0][0].placements).toEqual({
      home_stories: { quantity: DEFAULT_QUANTITY, types: ["story"] },
    });
  });

  it("requests the given quantity and keeps no more", async () => {
    const stories = storiesOf(4);
    getRawAdsMock.mockResolvedValue(rawAdsWith(stories));

    await expect(fetchStories({ ...REQUEST, quantity: 3 })).resolves.toEqual(
      stories.slice(0, 3),
    );
    expect(requestedQuantity()).toBe(3);
  });

  it("rounds a fractional quantity down", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

    await fetchStories({ ...REQUEST, quantity: 2.7 });

    expect(requestedQuantity()).toBe(2);
  });

  it.each([0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    `requests ${DEFAULT_QUANTITY} for a quantity of %s`,
    async (quantity) => {
      getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

      await fetchStories({ ...REQUEST, quantity });

      expect(requestedQuantity()).toBe(DEFAULT_QUANTITY);
    },
  );

  // Starts a hanging request and checks it is cancelled exactly at `ms`.
  async function expectGivesUpAfter(ms: number, timeout?: number) {
    hangUntilAborted();

    const story = fetchStories(REQUEST, { timeout });
    await vi.advanceTimersByTimeAsync(ms - 1);
    expect(signalOfFirstCall()?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(story).resolves.toEqual([]);
    expect(signalOfFirstCall()?.reason).toMatchObject({ name: "TimeoutError" });
    expect(consoleError).not.toHaveBeenCalled();
  }

  it("gives up after 2 s by default", async () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(2000);
    await expectGivesUpAfter(DEFAULT_TIMEOUT_MS);
  });

  it("gives up after the given timeout", async () => {
    await expectGivesUpAfter(5000, 5000);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "uses the default for a timeout of %s",
    async (timeout) => {
      await expectGivesUpAfter(DEFAULT_TIMEOUT_MS, timeout);
    },
  );

  it("cancels the request when the caller's signal aborts", async () => {
    hangUntilAborted();
    const controller = new AbortController();

    const story = fetchStories(REQUEST, { signal: controller.signal });
    controller.abort();

    await expect(story).resolves.toEqual([]);
    expect(signalOfFirstCall()?.aborted).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("logs a failed request and resolves to no Stories", async () => {
    const error = new TypeError("Failed to fetch");
    getRawAdsMock.mockRejectedValue(error);

    await expect(fetchStories(REQUEST)).resolves.toEqual([]);
    expect(consoleError).toHaveBeenCalledWith(
      `[${TAG_NAME}] Story request failed`,
      {
        placement: REQUEST.placement,
        publisherId: REQUEST.publisherId,
        error,
      },
    );
  });

  it("clears the time limit once the request settles", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

    await fetchStories(REQUEST);

    expect(vi.getTimerCount()).toBe(0);
  });
});

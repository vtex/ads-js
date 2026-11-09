import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRawAds, type RawAdsResponse } from "@vtex/ads-core";
import { DEFAULT_TIMEOUT_MS, fetchStory } from "./fetch-story";
import { mockStory, rawAdsWith } from "../story/story.mock";

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

describe("fetchStory", () => {
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

  it("resolves to the first Story of the placement", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

    await expect(fetchStory(REQUEST)).resolves.toEqual(mockStory);
  });

  // Starts a hanging request and checks it is cancelled exactly at `ms`.
  async function expectGivesUpAfter(ms: number, timeout?: number) {
    hangUntilAborted();

    const story = fetchStory(REQUEST, { timeout });
    await vi.advanceTimersByTimeAsync(ms - 1);
    expect(signalOfFirstCall()?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(story).resolves.toBeUndefined();
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

    const story = fetchStory(REQUEST, { signal: controller.signal });
    controller.abort();

    await expect(story).resolves.toBeUndefined();
    expect(signalOfFirstCall()?.aborted).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("logs a failed request and resolves to undefined", async () => {
    const error = new TypeError("Failed to fetch");
    getRawAdsMock.mockRejectedValue(error);

    await expect(fetchStory(REQUEST)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      "[vtex-ads-story] Story request failed",
      {
        placement: REQUEST.placement,
        publisherId: REQUEST.publisherId,
        error,
      },
    );
  });

  it("clears the time limit once the request settles", async () => {
    getRawAdsMock.mockResolvedValue(rawAdsWith([mockStory]));

    await fetchStory(REQUEST);

    expect(vi.getTimerCount()).toBe(0);
  });
});

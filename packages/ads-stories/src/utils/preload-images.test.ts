import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeOf, FakeImage, resetImageMock } from "./image.mock";
import { MEDIA_TIMEOUT, preloadImages } from "./preload-images";

describe("preloadImages", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetImageMock();
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const settled = (promise: Promise<void>) => {
    const state = { done: false };
    void promise.then(() => (state.done = true));
    return state;
  };

  it("resolves at once without images", async () => {
    await expect(preloadImages([])).resolves.toBeUndefined();
  });

  it("resolves at once without Image", async () => {
    vi.stubGlobal("Image", undefined);
    await expect(preloadImages(["https://a/1.png"])).resolves.toBeUndefined();
  });

  it("waits until every image is decoded", async () => {
    const state = settled(
      preloadImages(["https://a/1.png", "https://a/2.png"]),
    );

    decodeOf("https://a/1.png")?.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(state.done).toBe(false);

    decodeOf("https://a/2.png")?.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(state.done).toBe(true);
  });

  it("doesn't let a broken image hold the rest", async () => {
    const state = settled(
      preloadImages(["https://a/1.png", "https://a/2.png"]),
    );

    decodeOf("https://a/1.png")?.reject();
    decodeOf("https://a/2.png")?.resolve();
    await vi.advanceTimersByTimeAsync(0);

    expect(state.done).toBe(true);
  });

  it("gives up after MEDIA_TIMEOUT", async () => {
    const state = settled(preloadImages(["https://a/1.png"]));

    await vi.advanceTimersByTimeAsync(MEDIA_TIMEOUT - 1);
    expect(state.done).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(state.done).toBe(true);
  });

  it("stops waiting when the signal aborts, and leaves no timer", async () => {
    const controller = new AbortController();
    const state = settled(
      preloadImages(["https://a/1.png"], controller.signal),
    );

    controller.abort();
    await vi.advanceTimersByTimeAsync(0);

    expect(state.done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears its timer once the images are ready", async () => {
    void preloadImages(["https://a/1.png"]);
    decodeOf("https://a/1.png")?.resolve();
    await vi.advanceTimersByTimeAsync(0);

    expect(vi.getTimerCount()).toBe(0);
  });
});

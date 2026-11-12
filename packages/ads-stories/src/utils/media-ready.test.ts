import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeOf, FakeImage, resetImageMock } from "./image.mock";
import { decodeImage, firstReady, MEDIA_TIMEOUT } from "./media-ready";

const settled = (promise: Promise<unknown>) => {
  const state = { done: false };
  void promise.then(() => (state.done = true));
  return state;
};

function check() {
  let settle!: (ready: boolean) => void;
  const promise = new Promise<boolean>((r) => (settle = r));
  return { promise, settle };
}

describe("decodeImage", () => {
  beforeEach(() => {
    resetImageMock();
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves true once the image is decoded", async () => {
    const ready = decodeImage("https://a/1.png");
    decodeOf("https://a/1.png")?.resolve();

    await expect(ready).resolves.toBe(true);
  });

  it("resolves false when the image fails", async () => {
    const ready = decodeImage("https://a/1.png");
    decodeOf("https://a/1.png")?.reject();

    await expect(ready).resolves.toBe(false);
  });

  it("resolves true at once without Image", async () => {
    vi.stubGlobal("Image", undefined);

    await expect(decodeImage("https://a/1.png")).resolves.toBe(true);
  });
});

describe("firstReady", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves at once without checks", async () => {
    await expect(firstReady([])).resolves.toBeUndefined();
  });

  it("resolves when the first check is ready", async () => {
    const [a, b] = [check(), check()];
    const state = settled(firstReady([a.promise, b.promise]));

    b.settle(true);
    await vi.advanceTimersByTimeAsync(0);

    expect(state.done).toBe(true);
  });

  it("keeps waiting while a failed check leaves another", async () => {
    const [a, b] = [check(), check()];
    const state = settled(firstReady([a.promise, b.promise]));

    a.settle(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(state.done).toBe(false);

    b.settle(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(state.done).toBe(true);
  });

  it("gives up after MEDIA_TIMEOUT", async () => {
    const state = settled(firstReady([check().promise]));

    await vi.advanceTimersByTimeAsync(MEDIA_TIMEOUT - 1);
    expect(state.done).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(state.done).toBe(true);
  });

  it("stops waiting when the signal aborts, and clears its timer", async () => {
    const controller = new AbortController();
    const state = settled(firstReady([check().promise], controller.signal));

    controller.abort();
    await vi.advanceTimersByTimeAsync(0);

    expect(state.done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});

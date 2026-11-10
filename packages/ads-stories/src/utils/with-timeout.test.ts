import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withTimeout } from "./with-timeout";

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aborts with a TimeoutError after the given time", () => {
    const { signal } = withTimeout(100, 500);

    vi.advanceTimersByTime(99);
    expect(signal.aborted).toBe(false);

    vi.advanceTimersByTime(1);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toMatchObject({ name: "TimeoutError" });
  });

  it("aborts with the caller's reason when the caller aborts", () => {
    const controller = new AbortController();
    const { signal } = withTimeout(100, 500, controller.signal);

    controller.abort("navigated away");

    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe("navigated away");
  });

  it("starts aborted when the caller's signal already is", () => {
    const controller = new AbortController();
    controller.abort("already");

    const { signal } = withTimeout(100, 500, controller.signal);

    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe("already");
  });

  it("stops the timer and the caller listener when cleared", () => {
    const controller = new AbortController();
    const { signal, clear } = withTimeout(100, 500, controller.signal);

    clear();
    vi.advanceTimersByTime(100);
    controller.abort();

    expect(vi.getTimerCount()).toBe(0);
    expect(signal.aborted).toBe(false);
  });
});

describe("withTimeout's fallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "waits the fallback for a timeout of %s",
    (timeout) => {
      const { signal } = withTimeout(timeout, 500);

      vi.advanceTimersByTime(499);
      expect(signal.aborted).toBe(false);
      vi.advanceTimersByTime(1);
      expect(signal.aborted).toBe(true);
    },
  );

  it("waits a valid timeout, not the fallback", () => {
    const { signal } = withTimeout(100, 500);

    vi.advanceTimersByTime(100);
    expect(signal.aborted).toBe(true);
  });
});

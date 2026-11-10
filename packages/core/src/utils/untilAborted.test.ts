import { describe, it, expect, vi } from "vitest";
import { untilAborted } from "./untilAborted";

const never = () => new Promise<string>(() => {});

describe("untilAborted", () => {
  it("settles as the promise without a signal", async () => {
    await expect(untilAborted(Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("settles as the promise when it comes first", async () => {
    const { signal } = new AbortController();

    await expect(untilAborted(Promise.resolve("ok"), signal)).resolves.toBe(
      "ok",
    );
    await expect(
      untilAborted(Promise.reject(new Error("failed")), signal),
    ).rejects.toThrow("failed");
  });

  it("rejects with the reason when the signal aborts first", async () => {
    const controller = new AbortController();
    const reason = new DOMException("Timed out", "TimeoutError");

    const result = untilAborted(never(), controller.signal);
    controller.abort(reason);

    await expect(result).rejects.toBe(reason);
  });

  it("rejects at once with a signal already aborted", async () => {
    const reason = new Error("cancelled");

    await expect(untilAborted(never(), AbortSignal.abort(reason))).rejects.toBe(
      reason,
    );
  });

  it("stops listening to the signal once the promise settles", async () => {
    const { signal } = new AbortController();
    const removeListener = vi.spyOn(signal, "removeEventListener");

    await untilAborted(Promise.resolve("ok"), signal);
    await new Promise((resolve) => setTimeout(resolve));

    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
  });
});

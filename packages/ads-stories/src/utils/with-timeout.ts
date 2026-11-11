/**
 * A signal that aborts when the caller's signal aborts or after `timeout`
 * milliseconds, whichever comes first. A `timeout` missing, zero, negative or
 * not a number uses `fallback`. Built by hand instead of with
 * `AbortSignal.any` and `AbortSignal.timeout`, which older browsers lack.
 *
 * Call `clear()` once the work is done, so the timer and the listener on the
 * caller's signal don't outlive it.
 */
export const withTimeout = (
  timeout: number | undefined,
  fallback: number,
  signal?: AbortSignal,
): { signal: AbortSignal; clear: () => void } => {
  const ms =
    timeout !== undefined && Number.isFinite(timeout) && timeout > 0
      ? timeout
      : fallback;
  const controller = new AbortController();

  const timer = setTimeout(
    () =>
      controller.abort(
        new DOMException(`Timed out after ${ms} ms`, "TimeoutError"),
      ),
    ms,
  );
  const onAbort = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    onAbort();
  } else {
    signal?.addEventListener("abort", onAbort, { once: true });
  }

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
};

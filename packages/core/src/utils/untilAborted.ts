/**
 * Settles as `promise` does, or rejects with the signal's reason as soon as
 * `signal` aborts, whichever comes first: a cancelled or timed out call ends
 * even when the work it waits for ignores the signal.
 */
export const untilAborted = <T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (!signal) return promise;

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener("abort", onAbort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
};

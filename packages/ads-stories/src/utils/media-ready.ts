import { withTimeout } from "./with-timeout";

/** How long the first Story's media may take before it shows anyway, in ms. */
export const MEDIA_TIMEOUT = 3000;

/**
 * Loads and decodes an image, so it paints at once when it shows. Resolves
 * true once it is ready and false if it fails. Never rejects.
 *
 * Without `Image` or `decode` (SSR, old browsers, jsdom) there is nothing to
 * wait for: it resolves true at once.
 */
export function decodeImage(url: string): Promise<boolean> {
  if (typeof Image === "undefined") return Promise.resolve(true);

  const image = new Image();
  image.src = url;
  if (!image.decode) return Promise.resolve(true);
  return image.decode().then(
    () => true,
    () => false,
  );
}

/**
 * Waits for the first of `checks` to be ready: resolves when one resolves
 * true, when all resolved false (nothing left to wait for), after
 * MEDIA_TIMEOUT, or when `signal` aborts. Never rejects.
 */
export function firstReady(
  checks: readonly Promise<boolean>[],
  signal?: AbortSignal,
): Promise<void> {
  if (!checks.length) return Promise.resolve();

  const limit = withTimeout(undefined, MEDIA_TIMEOUT, signal);

  return new Promise<void>((resolve) => {
    const done = () => {
      limit.clear();
      resolve();
    };
    if (limit.signal.aborted) return done();
    limit.signal.addEventListener("abort", done, { once: true });

    let failed = 0;
    for (const check of checks) {
      check.then(
        (ready) => {
          if (ready || ++failed === checks.length) done();
        },
        () => {
          if (++failed === checks.length) done();
        },
      );
    }
  });
}

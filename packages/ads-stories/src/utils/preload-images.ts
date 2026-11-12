import { withTimeout } from "./with-timeout";

/** How long the images may take before the Stories show anyway, in ms. */
export const MEDIA_TIMEOUT = 3000;

/**
 * Loads and decodes the images, so they paint at once when the cards show.
 * Resolves when every image is ready or failed (a broken one doesn't hold the
 * rest), after MEDIA_TIMEOUT, or when `signal` aborts. Never rejects.
 *
 * Without `Image` or `decode` (SSR, old browsers, jsdom) there is nothing to
 * wait for: it resolves at once.
 */
export function preloadImages(
  urls: readonly string[],
  signal?: AbortSignal,
): Promise<void> {
  if (!urls.length || typeof Image === "undefined") return Promise.resolve();

  const limit = withTimeout(undefined, MEDIA_TIMEOUT, signal);

  return new Promise<void>((resolve) => {
    const done = () => {
      limit.clear();
      resolve();
    };
    if (limit.signal.aborted) return done();
    limit.signal.addEventListener("abort", done, { once: true });

    void Promise.all(
      urls.map((url) => {
        const image = new Image();
        image.src = url;
        return image.decode?.().catch(() => {});
      }),
    ).then(done);
  });
}

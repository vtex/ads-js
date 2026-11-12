import { httpUrl } from "./http-url";
import { TAG_NAME } from "../tag-name";

// A CORS-safelisted type: the browser sends the event without a preflight
// request, and sendBeacon accepts it everywhere. The event host reads the
// body as JSON whatever its type.
const CONTENT_TYPE = "text/plain;charset=utf-8";

/** Who the event is for: the same session sent in the ad request. */
export interface EventIdentity {
  sessionId: string;
  userId?: string;
}

/**
 * Sends an impression, view or click to the event URL from the ad response,
 * as VTEX Ads asks of browsers: a POST with a JSON body holding `session_id`
 * and, when known, `user_id`, through `navigator.sendBeacon`, so the event
 * survives the page being left. Without the Beacon API, or when the browser
 * refuses to queue the beacon, it falls back to a `fetch` with `keepalive`.
 * The body goes as `text/plain` (see CONTENT_TYPE).
 *
 * The fallback isn't awaited: it returns true once the `fetch` starts, and a
 * failed request is logged, not sent again. The server deduplicates by
 * session anyway, and a retry could outlive the page.
 *
 * Returns false, sending nothing, when the URL isn't an absolute http(s)
 * URL, during server-side rendering or when both ways fail at once.
 */
export function sendEvent(
  url: string | undefined,
  { sessionId, userId }: EventIdentity,
): boolean {
  const target = httpUrl(url);
  if (!target || globalThis.window === undefined) return false;

  const body = JSON.stringify(
    userId
      ? { session_id: sessionId, user_id: userId }
      : { session_id: sessionId },
  );

  try {
    const queued = globalThis.navigator?.sendBeacon?.(
      target,
      new Blob([body], { type: CONTENT_TYPE }),
    );
    if (queued) return true;
  } catch {
    // A browser that throws instead of refusing (for example, for a URL it
    // won't beacon to): the fetch below sends it instead.
  }

  if (typeof globalThis.fetch !== "function") return false;

  globalThis
    .fetch(target, {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPE },
      body,
      keepalive: true,
      credentials: "omit",
    })
    .catch((error: unknown) => {
      console.error(`[${TAG_NAME}] Event request failed`, {
        url: target,
        error,
      });
    });
  return true;
}

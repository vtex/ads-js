import { httpUrl } from "../components/media";
import { TAG_NAME } from "../tag-name";

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
      new Blob([body], { type: "application/json" }),
    );
    if (queued) return true;
  } catch {
    // Some browsers throw for a Blob that isn't a simple content type: the
    // fetch below sends it instead.
  }

  if (typeof globalThis.fetch !== "function") return false;

  globalThis
    .fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

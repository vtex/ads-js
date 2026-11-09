import { getRawAds, type Channel } from "@vtex/ads-core";
import type { StoryAd } from "../types";
import { withTimeout } from "./with-timeout";

/**
 * Default time limit for the Story request, in milliseconds. A card that
 * shows up later than this would appear well after the page loaded.
 */
export const DEFAULT_TIMEOUT_MS = 2000;

/** What the element sends to the ad API. */
export interface StoryRequest {
  /** Required. */
  publisherId?: string;
  /** Required. */
  sessionId?: string;
  /** Required. */
  placement?: string;
  userId?: string;
  accountName?: string;
  channel?: Channel;
}

export interface FetchStoryOptions {
  /** Cancels the request. */
  signal?: AbortSignal;
  /**
   * Time limit in milliseconds. Missing, zero, negative or not a number:
   * DEFAULT_TIMEOUT_MS.
   */
  timeout?: number;
}

const toTimeout = (timeout?: number) =>
  timeout !== undefined && Number.isFinite(timeout) && timeout > 0
    ? timeout
    : DEFAULT_TIMEOUT_MS;

/**
 * Requests one Story for the placement from the ad API.
 *
 * Resolves to undefined, without throwing, when a required value is missing,
 * during server-side rendering, when the request fails, is cancelled or takes
 * longer than the time limit, or when the placement has no Story.
 */
export async function fetchStory(
  {
    publisherId,
    sessionId,
    placement,
    userId,
    accountName,
    channel,
  }: StoryRequest,
  { signal, timeout }: FetchStoryOptions = {},
): Promise<StoryAd | undefined> {
  // No request during server-side rendering, where nothing renders. Not
  // Lit's isServer: it is also true in Node with a DOM, as in the tests.
  const onServer = globalThis.window === undefined;
  if (onServer || !publisherId || !sessionId || !placement) return undefined;

  const limit = withTimeout(toTimeout(timeout), signal);

  try {
    const { stories } = await getRawAds(
      {
        identity: {
          accountName: accountName ?? "",
          publisherId,
          sessionId,
          userId,
          channel,
        },
        search: {},
        // One card for now; the carousel will request more.
        placements: { [placement]: { quantity: 1, types: ["story"] } },
      },
      { signal: limit.signal },
    );

    return stories[placement]?.[0];
  } catch (error) {
    // A cancelled or timed out request needs no log. Anything else (network
    // failure, HTTP or validation error) is logged, so a failing request can
    // be told apart from a placement with no Story.
    if (!limit.signal.aborted) {
      console.error("[vtex-ads-story] Story request failed", {
        placement,
        publisherId,
        error,
      });
    }
    return undefined;
  } finally {
    limit.clear();
  }
}

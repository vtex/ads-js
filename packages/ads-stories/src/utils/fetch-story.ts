import { getRawAds, type Channel } from "@vtex/ads-core";
import type { StoryAd } from "../types";
import { withTimeout } from "./with-timeout";

/**
 * Default time limit for the Story request, in milliseconds. A card that
 * shows up later than this would appear well after the page loaded.
 */
export const DEFAULT_TIMEOUT_MS = 2000;

/**
 * How many Stories the element asks for.
 */
export const DEFAULT_QUANTITY = 8;

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
  /**
   * How many Stories to ask for: the carousel positions. Missing, below 1 or
   * not a number: DEFAULT_QUANTITY. A fraction is rounded down.
   */
  quantity?: number;
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

const toQuantity = (quantity?: number) =>
  quantity !== undefined && Number.isFinite(quantity) && quantity >= 1
    ? Math.floor(quantity)
    : DEFAULT_QUANTITY;

/**
 * Requests up to `quantity` Stories for the placement from the ad API, in
 * the order the ad API returns them.
 *
 * Resolves to an empty list, without throwing, when a required value is
 * missing, during server-side rendering, when the request fails, is cancelled
 * or takes longer than the time limit, or when the placement has no Story.
 */
export async function fetchStories(
  {
    publisherId,
    sessionId,
    placement,
    userId,
    accountName,
    channel,
    quantity,
  }: StoryRequest,
  { signal, timeout }: FetchStoryOptions = {},
): Promise<StoryAd[]> {
  // No request during server-side rendering, where nothing renders. Not
  // Lit's isServer: it is also true in Node with a DOM, as in the tests.
  const onServer = globalThis.window === undefined;
  if (onServer || !publisherId || !sessionId || !placement) return [];

  const limit = withTimeout(timeout, DEFAULT_TIMEOUT_MS, signal);
  const count = toQuantity(quantity);

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
        placements: {
          [placement]: { quantity: count, types: ["story"] },
        },
      },
      { signal: limit.signal },
    );

    // The ad API may send more than asked for: only the first ones fit.
    return (stories[placement] ?? []).slice(0, count);
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
    return [];
  } finally {
    limit.clear();
  }
}

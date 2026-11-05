import { getRawAds, type Channel } from "@vtex/ads-core";
import type { StoryAd } from "../types";

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

/**
 * Requests one Story for the placement from the ad API.
 *
 * Resolves to undefined, without throwing, when a required value is missing,
 * during server-side rendering, when the request fails or when the placement
 * has no Story.
 */
export async function fetchStory({
  publisherId,
  sessionId,
  placement,
  userId,
  accountName,
  channel,
}: StoryRequest): Promise<StoryAd | undefined> {
  // No request during server-side rendering, where nothing renders. Not
  // Lit's isServer: it is also true in Node with a DOM, as in the tests.
  const onServer = typeof window === "undefined";
  if (onServer || !publisherId || !sessionId || !placement) return undefined;

  try {
    const { stories } = await getRawAds({
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
    });

    return stories[placement]?.[0];
  } catch {
    // @vtex/ads-core already logs the error.
    return undefined;
  }
}

import type { StoryAdDetail } from "@vtex/ads-core";

/** One Story from the ad API response, as returned by `@vtex/ads-core`. */
export type StoryAd = StoryAdDetail;

/**
 * What the card and the player show: the cover and the video. Both optional,
 * so a Story missing either still renders what it has.
 */
export type StoryMedia = Partial<Pick<StoryAd, "poster_url" | "media_url">>;

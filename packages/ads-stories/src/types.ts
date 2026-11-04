/**
 * One Story from the ad API response. Field names follow the API; only the
 * fields the component reads so far are listed.
 */
export interface StoryAd {
  ad_id: string;
  /** Cover image shown before the video plays. */
  poster_url?: string;
  /** The 9:16 MP4 the card and the player play. */
  media_url?: string;
}

/** What the card and the player show: the cover and the video. */
export type StoryMedia = Pick<StoryAd, "poster_url" | "media_url">;

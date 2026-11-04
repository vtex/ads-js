/**
 * One Story from the ad API response. Field names follow the API; only the
 * fields the component reads so far are listed.
 */
export interface StoryAd {
  ad_id: string;
  /** Cover image shown before the video plays. */
  poster_url?: string;
}

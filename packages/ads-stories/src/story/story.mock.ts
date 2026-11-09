import type { RawAdsResponse, StoryAdDetail } from "@vtex/ads-core";

/** The attributes the element needs to request a Story. */
export const REQUIRED_ATTRIBUTES = {
  "publisher-id": "publisher-1",
  "session-id": "session-1",
  placement: "home_stories",
};

/** A Story with a real cover and video, also served by the playground. */
export const mockStory: StoryAdDetail = {
  type: "story",
  ad_id: "story-ad-1",
  campaign_id: "campaign-1",
  seller_id: "1",
  position: 0,
  campaign_name: "Story campaign",
  asset_type: "video",
  media_url: "https://samplelib.com/mp4/sample-10s-vp9.mp4",
  poster_url: "https://dummyimage.com/1080x1920/e31c57/fff",
  duration_seconds: 10,
  destination_url: "https://www.example.com/product/p",
  product: null,
  impression_url: "https://events.example/impression",
  view_url: "https://events.example/view",
  click_url: "https://events.example/click",
};

/** A getRawAds response with the given Stories in one placement. */
export const rawAdsWith = (
  stories: StoryAdDetail[],
  placement = "home_stories",
): RawAdsResponse => ({
  sponsoredProducts: {},
  stories: { [placement]: stories },
  banners: undefined,
  sponsoredBrands: undefined,
});

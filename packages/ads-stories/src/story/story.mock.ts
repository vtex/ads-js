import type { RawAdsResponse, StoryAdDetail } from "@vtex/ads-core";

/** The attributes the element needs to request a Story. */
export const REQUIRED_ATTRIBUTES = {
  "publisher-id": "publisher-1",
  "session-id": "session-1",
  placement: "home_stories",
};

/**
 * Where the mock Stories' events go, as the ad server's beacon URLs:
 * `<base>/<impression|view|click>/<ad_id>`. Answered by the playground's MSW
 * handlers.
 */
export const MOCK_EVENTS_BASE = "https://events.example/v1/beacon";

/** The impression, view and click URLs of a mock Story. */
const eventUrls = (adId: string) => ({
  impression_url: `${MOCK_EVENTS_BASE}/impression/${adId}`,
  view_url: `${MOCK_EVENTS_BASE}/view/${adId}`,
  click_url: `${MOCK_EVENTS_BASE}/click/${adId}`,
});

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
  product: {
    product_sku: "sku-1",
    seller_id: "1",
    product_name: "Tênis de corrida leve com amortecimento responsivo",
    image_url: "https://dummyimage.com/240x240/fff/e31c57&text=SKU+1",
    url: "https://www.example.com/product/p",
    product_metadata: { price: 159.9, promotional_price: 129.9 },
  },
  ...eventUrls("story-ad-1"),
};

/** Several Stories in ad server order, served by the playground. */
export const mockStories: StoryAdDetail[] = [
  mockStory,
  {
    ...mockStory,
    ad_id: "story-ad-2",
    ...eventUrls("story-ad-2"),
    campaign_id: "campaign-2",
    position: 1,
    campaign_name: "Story campaign 2",
    media_url: "https://samplelib.com/mp4/sample-5s.mp4",
    poster_url: "https://dummyimage.com/1080x1920/1c57e3/fff",
    duration_seconds: 5,
    destination_url: "https://www.example.com/product-2/p",
    product: {
      product_sku: "sku-2",
      seller_id: "1",
      product_name: "Garrafa térmica 500 ml",
      image_url: "https://dummyimage.com/240x240/fff/1c57e3&text=SKU+2",
      url: "https://www.example.com/product-2/p",
      product_metadata: { price: 89.9 },
    },
  },
  {
    ...mockStory,
    ad_id: "story-ad-3",
    ...eventUrls("story-ad-3"),
    campaign_id: "campaign-3",
    position: 2,
    campaign_name: "Story campaign 3",
    media_url: "https://samplelib.com/mp4/sample-15s.mp4",
    poster_url: "https://dummyimage.com/1080x1920/1ce357/fff",
    duration_seconds: 15,
    destination_url: "https://www.example.com/product-3/p",
    product: {
      product_sku: "sku-3",
      seller_id: "1",
      product_name: "Mochila urbana",
      image_url: "https://dummyimage.com/240x240/fff/1ce357&text=SKU+3",
      url: "https://www.example.com/product-3/p",
      product_metadata: {},
    },
  },
  {
    ...mockStory,
    ad_id: "story-ad-4",
    ...eventUrls("story-ad-4"),
    campaign_id: "campaign-4",
    position: 3,
    campaign_name: "Story campaign 4",
    poster_url: "https://dummyimage.com/1080x1920/e3a51c/fff",
    // A link destination: no product.
    destination_url: "https://www.example.com/campaign",
    product: null,
    call_to_action: "Ver oferta",
  },
];

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

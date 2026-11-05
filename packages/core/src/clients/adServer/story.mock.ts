import type { StoryAdDetail } from "./types";

// A Story ad as the ad server returns it, shared by the core tests.
export const mockStory: StoryAdDetail = {
  type: "story",
  ad_id: "story1",
  campaign_id: "campaign1",
  seller_id: "1",
  position: 0,
  campaign_name: "Story campaign",
  asset_type: "video",
  media_url: "https://cdn.example.com/story.mp4",
  poster_url: "https://cdn.example.com/story.jpg",
  duration_seconds: 14,
  destination_url: "https://www.publisher.com/produto/p",
  product: {
    product_sku: "sku1",
    seller_id: "1",
    product_name: "Product 1",
    image_url: "https://cdn.example.com/product.jpg",
    url: "https://www.publisher.com/produto/p",
    product_metadata: {},
  },
  impression_url: "https://events.example.com/impression",
  view_url: "https://events.example.com/view",
  click_url: "https://events.example.com/click",
};

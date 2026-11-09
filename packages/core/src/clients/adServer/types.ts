/**
 * Channel type for ad requests
 * @public
 */
export type Channel = "site" | "app";

export type NavigationContext =
  | "search"
  | "category"
  | "brand_page"
  | "product_page"
  | "home";

/**
 * Placement identifier for ad positions. Known values include
 * `search_top_product`, `search_top-shelf_product`, `home_shelf_product`,
 * `pdp_shelf_product`, `plp_shelf_product`, `autocomplete_product`, and
 * `search_top_brand`, but any string is accepted.
 * @public
 */
export type Placement = string;

/**
 * Type of advertisement
 * @public
 */
export type AdType =
  | "product"
  | "banner"
  | "sponsored_brand"
  | "video"
  | "sponsored_brand_video"
  | "story";

/**
 * Configuration for ad placement requests
 * @public
 */
export interface PlacementBody {
  quantity: number;
  size?: string;
  types: AdType[];
}

export interface AdRequest {
  context: NavigationContext;
  term?: string;
  brand_name?: string;
  category_name?: string;
  user_id?: string;
  session_id: string;
  tags?: string[];
  placements: Partial<Record<Placement, PlacementBody>>;
  channel?: Channel;
  product_sku?: string;
}

/**
 * Sponsored product detail from ad server response
 * @public
 */
export interface SponsoredProductDetail {
  ad_id?: string;
  click_url: string;
  impression_url: string;
  view_url: string;
  product_name: string;
  product_sku: string;
  image_url?: string;
  seller_id?: string;
  destination_url?: string;
  product_metadata: {
    productId: string;
  };
}

export interface SponsoredBrandDetail {
  products: SponsoredProductDetail[];
  ad_id: string;
  click_url: string;
  impression_url: string;
  view_url: string;
  brand_url: string;
  brand_name: string;
  headline: string;
  description: string;
  destination_url: string;
  assets?: {
    type?: string;
    url: string;
  }[];
}

/**
 * Product featured by a Story ad. Present only when the Story's destination
 * is the product page.
 * @public
 */
export interface StoryProduct {
  product_sku: string;
  seller_id?: string;
  product_name: string;
  image_url?: string;
  url?: string;
  /**
   * Catalog data indexed by the ad server. Can be empty.
   */
  product_metadata: Record<string, unknown>;
}

/**
 * Story ad from the ad server response. One item per carousel card.
 * @public
 */
export interface StoryAdDetail {
  type: "story";
  ad_id: string;
  campaign_id: string;
  seller_id?: string;
  /**
   * Position of the card in the carousel.
   */
  position: number;
  campaign_name: string;
  asset_type: "video";
  /**
   * 9:16 MP4 (1080 × 1920) that the player plays.
   */
  media_url: string;
  /**
   * JPG cover shown before the video starts.
   */
  poster_url: string;
  /**
   * Video duration in whole seconds, read from the stored file.
   */
  duration_seconds: number;
  /**
   * Advertiser link when the destination is a link, product page otherwise.
   */
  destination_url: string;
  /**
   * Featured product, or `null` when the destination is a link.
   */
  product: StoryProduct | null;
  /**
   * Text of the call to action button, set in the campaign. Only when the
   * destination is a link.
   */
  call_to_action?: string | null;
  impression_url: string;
  view_url: string;
  click_url: string;
}

export type AdsDetail =
  | SponsoredProductDetail
  | SponsoredBrandDetail
  | StoryAdDetail;

export interface AdResponse {
  [placement: string]: AdsDetail[];
}

export type AdResponseWithError = AdResponse & {
  validations: object[];
};

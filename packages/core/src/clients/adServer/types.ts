export type Channel = "site" | "app";

export type NavigationContext =
  | "search"
  | "category"
  | "brand"
  | "product_page"
  | "home";

export type Placement =
  | "search_top_product"
  | "search_top-shelf_product"
  | "home_shelf_product"
  | "pdp_shelf_product"
  | "plp_shelf_product"
  | "autocomplete_product"
  | "search_top_brand";

export type AdType = "product" | "banner" | "sponsored_brand";

export interface PlacementBody {
  quantity: number;
  size?: string;
  types: AdType[];
}

export interface AdRequest {
  context: NavigationContext;
  term?: string;
  category_name?: string;
  user_id: string;
  session_id: string;
  tags?: string[];
  placements: Record<Placement, PlacementBody>;
  channel?: Channel;
  product_sku?: string;
}

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
  product_metadata?: {
    productId?: string;
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

export type AdsDetail = SponsoredProductDetail | SponsoredBrandDetail;

export interface AdResponse {
  [placement: string]: AdsDetail[];
}

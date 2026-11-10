import {
  Placement,
  SponsoredProductDetail,
  StoryAdDetail,
} from "../clients/adServer";
import { Identity, RawAdsResponse } from "../types";

/**
 * Type alias for SKU identifier
 * @public
 */
export type SkuId = string;

/**
 * Type alias for seller identifier
 * @public
 */
export type SellerId = string;

/**
 * Offer object containing product and seller information
 * @public
 */
export type Offer = {
  skuId: string;
  sellerId: string;
  productId: string;
};

/**
 * Map of SKU IDs to seller IDs
 * @public
 */
export type OffersMap = Map<SkuId, SellerId[]>;

/**
 * Function type for matching products with offers
 * @public
 */
export type ProductMatchesOffer<TProduct> = (
  product: TProduct,
  offer: Offer,
) => boolean;

/**
 * Options for a product request made by a `ProductFetcher`.
 * @public
 */
export interface ProductFetcherOptions {
  /**
   * Cancels the product request. A fetcher that doesn't support it may
   * ignore it; the caller then ignores its result.
   */
  signal?: AbortSignal;
}

/**
 * Function type for fetching products based on offers
 * @public
 */
export type ProductFetcher<TProduct extends object> = (
  offers: Offer[],
  identity: Identity,
  options?: ProductFetcherOptions,
) => Promise<TProduct[]>;

/**
 * Result object containing hydrated products grouped by placement and failed
 * products
 * @public
 */
export interface HydratedProductsResult<T> {
  byPlacement: HydratedProductsByPlacements<T>;
  failed: SponsoredProductDetail[];
}

/**
 * Record of hydrated sponsored products grouped by placement
 * @public
 */
export type HydratedProductsByPlacements<T> = Record<
  Placement,
  HydratedSponsoredProduct<T>[]
>;

/**
 * Sponsored product enriched with advertisement data
 * @public
 */
export interface HydratedSponsoredProduct<T> {
  product: T;
  advertisement: {
    eventUrls: {
      click: string;
      impression: string;
      view: string;
    };
    // Base64 encoded string containing event parameters, used by
    // Activity Flow tracking.
    eventParameters: string;
    sponsoredBySellerId?: string;
  };
}

/**
 * Story ad with the product the fetcher found for it. `hydratedProduct` is
 * missing when the Story has no product (its destination is a link) or the
 * fetcher didn't find it: the Story then shows what the ad server sent.
 * @public
 */
export type HydratedStory<T> = StoryAdDetail & { hydratedProduct?: T };

/**
 * Record of hydrated Story ads grouped by placement
 * @public
 */
export type HydratedStoriesByPlacements<T> = Record<
  Placement,
  HydratedStory<T>[]
>;

/**
 * Ads to hydrate, as `getRawAds` returns them. Both are optional: pass only
 * the ad types to hydrate.
 * @public
 */
export type AdsToHydrate = Partial<
  Pick<RawAdsResponse, "sponsoredProducts" | "stories">
>;

/**
 * Ads enriched by `hydrateAds`
 * @public
 */
export interface HydratedAds<T> {
  /** As in `getHydratedAds`: products not found go to `failed`. */
  sponsoredProducts: HydratedProductsResult<T>;
  /** Every Story given, in the same order, found or not. */
  stories: HydratedStoriesByPlacements<T>;
}

/**
 * Response object containing hydrated advertisements data
 * @public
 */
export interface HydratedAdsResponse<T> {
  sponsoredProducts: HydratedProductsResult<T>;
  stories: HydratedStoriesByPlacements<T>;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
}

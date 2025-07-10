import { Placement, SponsoredProductDetail } from "../clients/adServer";
import { Identity } from "../types";

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
 * Function type for fetching products based on offers
 * @public
 */
export type ProductFetcher<TProduct extends object> = (
  offers: Offer[],
  identity: Identity,
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
 * Response object containing hydrated advertisements data
 * @public
 */
export interface HydratedAdsResponse<T> {
  sponsoredProducts: HydratedProductsResult<T>;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
}

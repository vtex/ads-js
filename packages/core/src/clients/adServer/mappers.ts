import { Offer } from "../../hydration/types";
import { AdResponse, SponsoredProductDetail } from "./types";

export type AdsByPlacement = [string, SponsoredProductDetail[]];

/**
 * Extracts an array of sponsored products by placement from an ad response.
 *
 * This function processes an `AdResponse` object, filtering out only the
 * sponsored products (those with a `product_sku` property) and organizes
 * them by their placement.
 *
 * @param adResponse - The ad response object containing ads grouped by
 * placement.
 *
 * @returns sponsoredProductArray An array of tuples, each containing a
 * placement and an array of sponsored products.
 */
export const getSponsoredProductArray = (
  adResponse: AdResponse,
): AdsByPlacement[] => {
  return Object.entries(adResponse)
    .filter(([, ads]) => ads instanceof Array)
    .map(
      ([placement, ads]) =>
        [
          placement,
          ads.filter((item) => "product_sku" in item),
        ] as AdsByPlacement,
    )
    .filter(([_, ads]) => ads.length > 0);
};

/**
 * Extracts the SKU ID and Seller ID from a single ad placement.
 *
 * If a sponsored offer comes without a `sellerId`, it's generally
 * assumed to be a 1P offer (`sellerId = "1"`). This normalization is
 * applied automatically.
 *
 * However, in rare cases, the ad server may omit the `sellerId` when
 * the advertiser-publisher relationship has no seller constraint. In
 * such cases, the sponsored ad can apply to any offer for the given SKU
 * — not necessarily seller 1.
 *
 * This implementation does not handle that edge case and will assume
 * all `null` seller IDs are seller `"1"`.
 *
 * @param ads A single ad placement containing a sponsored product.
 * @returns An object containing the SKU ID and Seller ID of the offer.
 */
export const getOffer = (ad: SponsoredProductDetail): Offer => ({
  skuId: ad.product_sku,
  sellerId: ad.seller_id ?? "1",
  productId: ad.product_metadata.productId,
});

export const getProductIds = (offers: Offer[]): string[] => {
  return offers.map((offer) => offer.productId);
};

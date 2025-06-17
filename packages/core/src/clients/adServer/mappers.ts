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
export const getSponsoredProductArray: (_: AdResponse) => AdsByPlacement[] = (
  adResponse,
) => {
  return Object.entries(adResponse)
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
 * Extracts SKU IDs from a list of ads by placement.
 *
 * @param ads An array of ad placements, where each element is a tuple
 * containing a placement identifier and an array of ads.
 * @returns skuIds An array of SKU IDs extracted from the ads.
 */
export const getSkuIds: (ads: AdsByPlacement[]) => string[] = (ads) => {
  return ads
    .map(([_placement, ad]) => {
      return ad.map((item) => item.product_sku);
    })
    .flat();
};

import { SponsoredProductDetail } from "../clients/adServer";
import { getOffer } from "../clients/adServer/mappers";
import { RawAdsByPlacements } from "../types";
import { buildHydratedProduct, ProductFinder } from "./mappers";
import { HydratedProductsByPlacements, HydratedProductsResult } from "./types";

/**
 * Add advertisement data to the products.
 *
 * @internal
 * @param ads - Sponsored products grouped by placement.
 * @param findProduct - Finds an offer's product among the fetched ones.
 * @returns HydratedProductsResult - The products found, grouped by placement
 * and enriched with ad metadata, and the ads whose product wasn't found.
 */
export const mergeAdsWithProducts = <T extends object>(
  ads: RawAdsByPlacements,
  findProduct: ProductFinder<T>,
): HydratedProductsResult<T> => {
  const merged: HydratedProductsByPlacements<T> = {};
  const failed: SponsoredProductDetail[] = [];

  for (const [placement, placementAds] of Object.entries(ads)) {
    for (const ad of placementAds) {
      const sponsoredOffer = getOffer(ad);
      const product = findProduct(sponsoredOffer);

      if (product) {
        merged[placement] ??= [];
        merged[placement].push(
          buildHydratedProduct(product, ad, sponsoredOffer),
        );
      } else {
        failed.push(ad);
      }
    }
  }

  return {
    byPlacement: merged,
    failed: failed,
  };
};

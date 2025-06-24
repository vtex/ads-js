import { SponsoredProductDetail } from "../clients/adServer";
import { AdsByPlacement, getOffer } from "../clients/adServer/mappers";
import { buildHydratedProduct } from "./mappers";
import {
  HydratedProductsByPlacements,
  HydratedProductsResult,
  ProductMatchesOffer,
} from "./types";

/**
 * Add advertisement data to the products.
 *
 * @internal
 * @param productsMetadata - Array of products to be enriched with ad data.
 * @param adsByPlacements - Array of ads grouped by placement.
 * @returns HydratedProductsByPlacements - An object where each key is a
 * placement and the value is an array of products enriched with ad metadata.
 */
export const mergeAdsWithProducts = <T extends object>(
  productsMetadata: T[],
  adsByPlacements: AdsByPlacement[],
  productMatchesOffer: ProductMatchesOffer<T>,
): HydratedProductsResult<T> => {
  const merged: HydratedProductsByPlacements<T> = {};
  const failed: SponsoredProductDetail[] = [];

  for (const [placement, ads] of adsByPlacements) {
    for (const ad of ads) {
      const sponsoredOffer = getOffer(ad);

      const product = productsMetadata.find((product) =>
        productMatchesOffer(product, sponsoredOffer),
      );

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

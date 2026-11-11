import { Offer } from "../../hydration/types";
import { AdResponse, SponsoredProductDetail, StoryAdDetail } from "./types";

export type AdsByPlacement = [string, SponsoredProductDetail[]];

export type StoriesByPlacement = [string, StoryAdDetail[]];

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
    .filter(([, ads]) => Array.isArray(ads))
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
 * Extracts an array of Story ads by placement from an ad response.
 *
 * Keeps only the items with `type === "story"` and drops placements left
 * without Stories.
 *
 * @param adResponse - The ad response object containing ads grouped by
 * placement.
 *
 * @returns storyArray An array of tuples, each containing a placement and an
 * array of Story ads.
 */
export const getStoryArray = (adResponse: AdResponse): StoriesByPlacement[] => {
  return Object.entries(adResponse)
    .filter(([, ads]) => Array.isArray(ads))
    .map(
      ([placement, ads]) =>
        [
          placement,
          ads.filter((item) => "type" in item && item.type === "story"),
        ] as StoriesByPlacement,
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

/**
 * Extracts the offer of a Story's product, or undefined when the Story has
 * none (its destination is a link).
 *
 * The seller is the product's, then the Story's, then `"1"`, as in
 * `getOffer`. The ad server doesn't send the product ID: it is read from
 * `product_metadata.productId` when the catalog indexed it, and is empty
 * otherwise, so a fetcher has to find the product by its SKU.
 *
 * @param story A Story ad from the ad server response.
 * @returns The offer of the Story's product, if it has one.
 */
export const getStoryOffer = (story: StoryAdDetail): Offer | undefined => {
  const { product } = story;
  if (!product) return undefined;

  const productId = product.product_metadata?.productId;

  return {
    skuId: product.product_sku,
    sellerId: product.seller_id ?? story.seller_id ?? "1",
    productId: typeof productId === "string" ? productId : "",
  };
};

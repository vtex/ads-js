import { Offer, OffersMap, SellerId, SkuId } from "../../types";
import { AdsByPlacement, getOffer } from "../../../clients/adServer/mappers";

/**
 * Builds a mapping from SKU IDs to arrays of seller IDs that have
 * sponsored offers.
 *
 * @param offers - An array of ad server offers, each containing a
 * `skuId` and possibly a `sellerId`.
 *
 * @returns A Map where each key is a `skuId`, and the value is an array
 * of `sellerId`s sponsoring that SKU.
 */
export const buildOffersMap = (offers: Offer[]): OffersMap => {
  const map = new Map<SkuId, SellerId[]>();

  for (const { skuId, sellerId } of offers) {
    const currentSellers = map.get(skuId);
    if (currentSellers) {
      currentSellers.push(sellerId);
    } else {
      map.set(skuId, [sellerId]);
    }
  }

  return map;
};

/**
 * Extracts offers (SKU and seller IDs) from a list of ads by placement.
 *
 * @param ads An array of ad placements, where each element is a tuple
 * containing a placement identifier and an array of ads.
 * @returns An array of objects, each containing a SKU ID and a Seller ID.
 */
export const extractOffersFromAds = (ads: AdsByPlacement[]): Offer[] =>
  ads.flatMap(([_, ad]) => ad.map((item) => getOffer(item)));

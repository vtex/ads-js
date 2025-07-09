import { Product } from "../../clients/search";
import { ProductMatchesOffer } from "../types";

/**
 * Implementation of productMatchesOffer using Integrated Search (IS)
 * Product type.
 *
 * @param product - Product object from Intelligent Search
 * @param offer - Offer object containing SKU and seller information
 * @returns true if the product matches the offer (same SKU and seller)
 * @public
 */
export const intelligentSearchMatcher: ProductMatchesOffer<Product> = (
  product,
  offer,
) =>
  product.items.some(
    (item) =>
      item.itemId === offer.skuId &&
      item.sellers.some((seller) => seller.sellerId === offer.sellerId),
  );

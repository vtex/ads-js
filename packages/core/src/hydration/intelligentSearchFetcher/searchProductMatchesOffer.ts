import { Product } from "../../clients/search";
import { Offer } from "../types";

/**
 * Implementation of productMatchesOffer using Integrated Search (IS)
 * Product type.
 */
export const searchProductMatchesOffer = (product: Product, offer: Offer) =>
  product.items.some(
    (item) =>
      item.itemId === offer.skuId &&
      item.sellers.some((seller) => seller.sellerId === offer.sellerId),
  );

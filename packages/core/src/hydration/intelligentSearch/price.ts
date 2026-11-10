import { Product } from "../../clients/search";
import { ProductPriceReader } from "../types";

const toAmount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * Implementation of `ProductPriceReader` for Intelligent Search (IS)
 * products.
 *
 * Reads `Price` and `ListPrice` from the commercial offer of the offer's SKU
 * and seller, as IS sends them, 0 included. `ListPrice` is kept only when it
 * is above `Price`. Undefined when the product doesn't have that SKU or
 * seller, or when `Price` isn't a number.
 *
 * @param product - Product object from Intelligent Search
 * @param offer - Offer object containing SKU and seller information
 * @returns The offer's price, if the product has one
 * @public
 */
export const intelligentSearchPrice: ProductPriceReader<Product> = (
  product,
  { skuId, sellerId },
) => {
  const offer = product.items
    .find((item) => item.itemId === skuId)
    ?.sellers.find((seller) => seller.sellerId === sellerId)?.commertialOffer;

  const price = toAmount(offer?.Price);
  if (price === undefined) return undefined;

  const listPrice = toAmount(offer?.ListPrice);
  return listPrice !== undefined && listPrice > price
    ? { price, listPrice }
    : { price };
};

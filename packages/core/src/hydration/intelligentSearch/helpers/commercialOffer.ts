import { CommertialOffer, Product } from "../../../clients/search";
import { Offer } from "../../types";

/**
 * The commercial offer of the offer's SKU and seller in an Intelligent
 * Search product, or undefined when the product doesn't have them.
 */
export const findCommercialOffer = (
  product: Product,
  { skuId, sellerId }: Offer,
): CommertialOffer | undefined =>
  product.items
    .find((item) => item.itemId === skuId)
    ?.sellers.find((seller) => seller.sellerId === sellerId)?.commertialOffer;

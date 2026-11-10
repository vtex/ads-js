import { Product } from "../../clients/search";
import { ProductAvailabilityReader } from "../types";
import { findCommercialOffer } from "./helpers/commercialOffer";

/**
 * Implementation of `ProductAvailabilityReader` for Intelligent Search (IS)
 * products.
 *
 * Reads `AvailableQuantity` from the commercial offer of the offer's SKU and
 * seller: available when above 0. Undefined when the product doesn't have
 * that SKU or seller, or when `AvailableQuantity` isn't a number. IS still
 * sends a price for an unavailable SKU.
 *
 * @param product - Product object from Intelligent Search
 * @param offer - Offer object containing SKU and seller information
 * @returns Whether the offer can be bought, if the product says
 * @public
 */
export const intelligentSearchAvailability: ProductAvailabilityReader<
  Product
> = (product, offer) => {
  const quantity = findCommercialOffer(product, offer)?.AvailableQuantity;
  return typeof quantity === "number" && !Number.isNaN(quantity)
    ? quantity > 0
    : undefined;
};

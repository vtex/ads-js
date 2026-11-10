import { getProductIds } from "../../clients/adServer/mappers";
import { Product as SearchProduct } from "../../clients/search";
import { getProductsByIds } from "../../clients/search/search";
import { Identity } from "../../types";
import { Offer, ProductFetcher, ProductFetcherOptions } from "../types";
import { filterProductsWithValidItems } from "./helpers/filters";

/**
 * Fetches products from Intelligent Search (IS) based on provided SKUs
 * and sellers.
 *
 * Implements `ProductFetcher` interface to fetch products.
 *
 * It changes the IS response to ensure the products to include only
 * those that match the specified SKUs and sellers.
 *
 * @param offers - Array of offers containing SKU and seller information
 * @param identity - Identity object containing account name
 * @param options - Request options, such as a signal to cancel it
 * @returns Promise resolving to array of products that match the offers
 * @public
 */
export const intelligentSearchFetcher: ProductFetcher<SearchProduct> = async (
  offers: Offer[],
  { accountName }: Identity,
  options?: ProductFetcherOptions,
) => {
  const ids = getProductIds(offers);

  const searchProducts = (
    await getProductsByIds(accountName, ids, { signal: options?.signal })
  ).products;

  return filterProductsWithValidItems(searchProducts, offers);
};

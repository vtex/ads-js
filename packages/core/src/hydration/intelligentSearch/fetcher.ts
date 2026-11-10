import { Product as SearchProduct } from "../../clients/search";
import {
  getProductsByIds,
  getProductsBySkuIds,
  MAX_PRODUCTS_PER_SEARCH,
} from "../../clients/search/search";
import { RequestOptions } from "../../clients/httpClient";
import { Identity } from "../../types";
import { Offer, ProductFetcher, ProductFetcherOptions } from "../types";
import { filterProductsWithValidItems } from "./helpers/filters";

type Search = typeof getProductsByIds;

const toBatches = <T>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    batches.push(items.slice(start, start + size));
  }
  return batches;
};

// One request per MAX_PRODUCTS_PER_SEARCH ids, all at once.
const searchInBatches = (
  search: Search,
  accountName: string,
  ids: string[],
  options: RequestOptions,
) =>
  toBatches(ids, MAX_PRODUCTS_PER_SEARCH).map((batch) =>
    search(accountName, batch, options),
  );

// The same product can come from both searches, or from two batches.
const uniqueProducts = (products: SearchProduct[]): SearchProduct[] => [
  ...new Map(products.map((product) => [product.productId, product])).values(),
];

/**
 * Fetches products from Intelligent Search (IS) based on provided SKUs
 * and sellers.
 *
 * Implements `ProductFetcher` interface to fetch products.
 *
 * Searches by product ID the offers that have one, and by SKU the others
 * (as the Stories' products, which come without a product ID). Sends one
 * request per MAX_PRODUCTS_PER_SEARCH ids, in parallel, and rejects if any
 * of them fails.
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
  const productIds = new Set<string>();
  const skuIds = new Set<string>();
  for (const { productId, skuId } of offers) {
    if (productId) productIds.add(productId);
    else skuIds.add(skuId);
  }

  const requestOptions = { signal: options?.signal };
  const responses = await Promise.all([
    ...searchInBatches(
      getProductsByIds,
      accountName,
      [...productIds],
      requestOptions,
    ),
    ...searchInBatches(
      getProductsBySkuIds,
      accountName,
      [...skuIds],
      requestOptions,
    ),
  ]);

  const searchProducts = uniqueProducts(
    responses.flatMap((response) => response.products),
  );

  return filterProductsWithValidItems(searchProducts, offers);
};

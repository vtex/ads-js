import { httpClient, RequestOptions } from "../httpClient";
import { SearchResponse } from "./types";

export const getSearchBaseUrl = (accountName: string) =>
  `https://${accountName}.vtexcommercestable.com.br/api/intelligent-search/`;

export const productSearchUrl = "product_search";

export const getProductsByIds = async (
  accountName: string,
  productIds: string[],
  options?: RequestOptions,
): Promise<SearchResponse> => {
  const baseUrl = getSearchBaseUrl(accountName);

  const q = `product:${productIds.join(";")}`;
  const path = `${productSearchUrl}?q=${q}`;

  return httpClient.get(baseUrl, path, options);
};

/**
 * Most products one search response returns: a query for more products
 * (or SKUs) than this loses the products past it.
 */
export const MAX_PRODUCTS_PER_SEARCH = 24;

/**
 * Searches the products that own the given SKUs, in one request. Each
 * product comes with all its SKUs, not only the ones asked for. Keep the
 * list to MAX_PRODUCTS_PER_SEARCH SKUs.
 */
export const getProductsBySkuIds = async (
  accountName: string,
  skuIds: string[],
  options?: RequestOptions,
): Promise<SearchResponse> => {
  const baseUrl = getSearchBaseUrl(accountName);

  const q = `sku:${skuIds.map(encodeURIComponent).join(";")}`;
  const path = `${productSearchUrl}?q=${q}`;

  return httpClient.get(baseUrl, path, options);
};

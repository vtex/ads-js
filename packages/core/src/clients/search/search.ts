import { httpClient } from "../httpClient";
import { SearchResponse } from "./types";

export const getSearchBaseUrl = (accountName: string) =>
  `https://${accountName}.vtexcommercestable.com.br/api/intelligent-search/`;

export const productSearchUrl = "product_search";

export const getProductsByIds = async (
  accountName: string,
  productIds: string[],
): Promise<SearchResponse> => {
  const baseUrl = getSearchBaseUrl(accountName);

  const q = `product:${productIds.join(";")}`;
  const path = `${productSearchUrl}?q=${q}`;

  return httpClient.get(baseUrl, path);
};

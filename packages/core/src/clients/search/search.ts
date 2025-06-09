import { httpClient } from "../httpClient";
import { SearchResponse } from "./types";

export const getSearchBaseUrl = (accountName: string) =>
  `https://${accountName}.vtexcommercestable.com.br/api/intelligent-search`;

export const productSearchUrl = "/product_search";

export const getProductsBySkuId = async (
  accountName: string,
  skuIds: string[],
): Promise<SearchResponse> => {
  const baseUrl = getSearchBaseUrl(accountName);
  return httpClient.post(baseUrl, productSearchUrl, { skuIds });
};

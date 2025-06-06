import { httpClient } from "../httpClient";
import { SearchResponse } from "./types";

const getSearchBaseUrl = (accountName: string) =>
  `https://${accountName}.vtexcommercestable.com.br/api/intelligent-search`;

const productSearchUrl = '/product_search';

export const getProductsBySkuId = async (
  accountName: string,
  skuIds: string[],
): Promise<SearchResponse> => {
  const baseUrl = getSearchBaseUrl(accountName)
  return httpClient.post(baseUrl, productSearchUrl, { skuIds });
};

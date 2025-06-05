import { post } from "../httpClient";
import { SearchResponse } from "./types";

export const getSearchBaseUrl = (an: string) =>
  `https://${an}.vtexcommercestable.com.br/api/intelligent-search`;

export const getProductsBySkuId = async (
  an: string,
  skuIds: string[],
): Promise<SearchResponse> => {
  const url = `${getSearchBaseUrl(an)}/product_search`;

  return post(url, { skuIds });
};

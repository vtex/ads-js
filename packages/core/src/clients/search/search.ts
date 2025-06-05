import fetch from "isomorphic-unfetch";
import { SearchResponse } from "./types";

const baseUrl = (an: string) =>
  `https://${an}.vtexcommercestable.com.br/api/intelligent-search`;

export const getProductsBySkuId = async (
  skuIds: string[],
): Promise<SearchResponse> => {
  const url = `${baseUrl}/product_search`;

  const data = {
    skuIds,
  };

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    return response.json();
  });
};

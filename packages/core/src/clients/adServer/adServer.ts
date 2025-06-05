import fetch from "isomorphic-unfetch";
import {
  AdRequest,
  AdResponse,
  Channel,
  NavigationContext,
  PlacementBody,
} from "./types";

export interface AdsArgs {
  publisherId: string;
  macId: string;
  context: NavigationContext;
  term?: string;
  placements: Record<string, PlacementBody>;
  categoryName?: string;
  productSku?: string;
  tags?: string[];
  channel?: Channel;
}

const baseUrl = "https://newtail-media.newtail.com.br/v1/rma/";

export const getAds = async ({
  publisherId,
  macId,
  context,
  term = "",
  placements,
  categoryName,
  productSku,
  tags,
  channel,
}: AdsArgs): Promise<AdResponse> => {
  const url = `${baseUrl}${publisherId}`;

  const data: AdRequest = {
    term,
    context,
    placements,
    user_id: macId,
    session_id: macId,
    category_name: categoryName,
    product_sku: productSku,
    tags,
    channel,
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

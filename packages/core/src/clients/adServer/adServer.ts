import { AdResponse, Channel, NavigationContext, PlacementBody } from "./types";
import { post } from "../httpClient";

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
  ...args
}: AdsArgs): Promise<AdResponse> => {
  const url = new URL(publisherId, baseUrl).toString();
  return post(url, args);
};

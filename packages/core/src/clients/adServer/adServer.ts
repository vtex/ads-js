import { httpClient } from "../httpClient";
import { AdRequest, AdResponse } from "./types";

export const baseUrl = "https://newtail-media.newtail.com.br/v1/rma/";

export const getAds = async (
  publisherId: string,
  args: AdRequest,
): Promise<AdResponse> => {
  return httpClient.post<AdResponse>(baseUrl, publisherId, args);
};

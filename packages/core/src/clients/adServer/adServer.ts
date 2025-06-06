import { httpClient } from "../httpClient";
import { AdRequest, AdResponse } from "./types";

export interface AdServerArgs extends AdRequest {
  publisher_id: string;
}

const baseUrl = "https://newtail-media.newtail.com.br/v1/rma/";

export const getAds = async ({
  publisher_id,
  ...args
}: AdServerArgs): Promise<AdResponse> => {
  return httpClient.post<AdResponse>(baseUrl, publisher_id, args);
};

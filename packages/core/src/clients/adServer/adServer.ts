import { httpClient } from "../httpClient";
import { AdRequest, AdResponse, AdResponseWithError } from "./types";

export const baseUrl = "https://newtail-media.newtail.com.br/v1/rma/";

export const getAds = async (
  publisherId: string,
  args: AdRequest,
): Promise<AdResponse> => {
  return httpClient
    .post<AdResponseWithError>(baseUrl, publisherId, args)
    .then((response) => {
      if (response.validations && response.validations.length > 0) {
        console.error(
          JSON.stringify(
            {
              description: "Newtail validation error",
              response,
            },
            null,
            2,
          ),
        );

        throw new Error("Newtail validation error");
      }

      return response as AdResponse;
    });
};

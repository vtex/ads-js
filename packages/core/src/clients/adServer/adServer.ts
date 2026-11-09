import { httpClient } from "../httpClient";
import { AdRequest, AdResponse, AdResponseWithError } from "./types";

export const baseUrl = "https://newtail-media.newtail.com.br/v1/rma/";

/**
 * Options for a request to the ad server.
 * @public
 */
export interface GetAdsOptions {
  /**
   * Cancels the request, for example with `AbortSignal.timeout(ms)` to set a
   * time limit. A cancelled request rejects: in browsers with the signal's
   * reason; other fetch implementations may reject with their own
   * `AbortError`.
   */
  signal?: AbortSignal;
}

export const getAds = async (
  publisherId: string,
  args: AdRequest,
  options?: GetAdsOptions,
): Promise<AdResponse> => {
  return httpClient
    .post<AdResponseWithError>(baseUrl, publisherId, args, {
      signal: options?.signal,
    })
    .then((response) => {
      if (response.validations && response.validations.length > 0) {
        console.error(
          JSON.stringify(
            {
              description: "Ads validation error",
              response,
            },
            null,
            2,
          ),
        );

        throw new Error("Ads validation error");
      }

      return response as AdResponse;
    });
};

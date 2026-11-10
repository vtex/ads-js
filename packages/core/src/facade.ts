import { getAds, GetAdsOptions } from "./clients/adServer";
import {
  getSponsoredProductArray,
  getStoryArray,
} from "./clients/adServer/mappers";
import { Product } from "./clients/search";
import { hydrateAds } from "./hydration/hydrateAds";
import {
  intelligentSearchFetcher,
  intelligentSearchMatcher,
} from "./hydration/intelligentSearch";
import {
  HydratedAdsResponse,
  ProductFetcher,
  ProductMatchesOffer,
} from "./hydration/types";
import { GetAdsArgs, RawAdsResponse } from "./types";
import { fromPlacementEntries } from "./utils/byPlacement";
import { toAdServerArgs } from "./utils/toAdServerArgs";

/**
 * Fetches raw advertisement data without enriching it with product details.
 *
 * @param args - Targeting arguments to fetch ads.
 * @param options - Request options, such as a signal to cancel it.
 * @returns RawAdsResponse - Sponsored products and Story ads, each grouped by
 * placement
 * @public
 */
export const getRawAds: (
  args: GetAdsArgs,
  options?: GetAdsOptions,
) => Promise<RawAdsResponse> = async (args, options) => {
  const adServerArgs = toAdServerArgs(args);
  const adResponse = await getAds(
    args.identity.publisherId,
    adServerArgs,
    options,
  );
  const response: RawAdsResponse = {
    sponsoredProducts: fromPlacementEntries(
      getSponsoredProductArray(adResponse),
    ),
    stories: fromPlacementEntries(getStoryArray(adResponse)),
    banners: undefined,
    sponsoredBrands: undefined,
  };

  return response;
};

/**
 * Fetches and enriches ad offers with corresponding product details.
 *
 * This function retrieves ads, fetches the products of the sponsored products
 * and of the Story ads in one fetcher call, as `hydrateAds`, and then returns
 * them with the advertisement data, the same for both. It waits for the
 * products: a fetcher failure rejects, Stories included. To show the ads
 * before their products, call `getRawAds` and then `hydrateAds`.
 *
 * @param args - Targeting arguments to fetch ads.
 * @param fetcher - Function to fetch product details from given offers.
 * @param matcher - Function to match products with offers.
 * @param options - Request options, such as a signal to cancel them. The
 * signal cancels the ad server request and the fetcher's product request.
 * @returns hydratedAds The sponsored search result consisting of products that
 * are sponsored by the ad server.
 * @public
 */
export const getHydratedAds = async <T extends object>(
  args: GetAdsArgs,
  fetcher: ProductFetcher<T>,
  matcher: ProductMatchesOffer<T>,
  options?: GetAdsOptions,
): Promise<HydratedAdsResponse<T>> => {
  const rawAds = await getRawAds(args, options);
  const { sponsoredProducts, stories } = await hydrateAds<T>(
    rawAds,
    fetcher,
    matcher,
    args.identity,
    { signal: options?.signal },
  );

  return {
    sponsoredProducts,
    stories,
    banners: undefined,
    sponsoredBrands: undefined,
  };
};

/**
 * Simple fallback hydration strategy using Intelligent Search.
 *
 * Warning: This implementation does not use cache and may degrade performance.
 * Prefer using `getHydratedAds` with a custom fetcher when possible.
 *
 * @param args - Targeting arguments to fetch ads.
 * @param options - Request options, such as a signal to cancel the ad server
 * and Intelligent Search requests.
 * @returns Promise resolving to hydrated ads response using Intelligent Search
 * @public
 */
export const getHydratedAdsByIS = (
  args: GetAdsArgs,
  options?: GetAdsOptions,
): Promise<HydratedAdsResponse<Product>> => {
  return getHydratedAds(
    args,
    intelligentSearchFetcher,
    intelligentSearchMatcher,
    options,
  );
};

import { getAds, GetAdsOptions } from "./clients/adServer";
import {
  getSponsoredProductArray,
  getStoryArray,
  StoriesByPlacement,
} from "./clients/adServer/mappers";
import { Product } from "./clients/search";
import { mergeAdsWithProducts } from "./hydration/mergeAdsWithProducts";
import {
  intelligentSearchFetcher,
  intelligentSearchMatcher,
} from "./hydration/intelligentSearch";
import {
  HydratedAdsResponse,
  ProductFetcher,
  ProductMatchesOffer,
} from "./hydration/types";
import {
  GetAdsArgs,
  RawAdsByPlacements,
  RawAdsResponse,
  StoriesByPlacements,
} from "./types";
import { toAdServerArgs } from "./utils/toAdServerArgs";
import { buildOffers } from "./hydration/mappers";

const toStoriesByPlacements = (
  stories: StoriesByPlacement[],
): StoriesByPlacements => {
  const byPlacements = {} as StoriesByPlacements;
  for (const [placement, placementStories] of stories) {
    byPlacements[placement] = placementStories;
  }
  return byPlacements;
};

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
  const adsArray = getSponsoredProductArray(adResponse);

  const adsByPlacements = {} as RawAdsByPlacements;

  adsArray.forEach(([placement, ads]) => {
    ads.forEach((ad) => {
      adsByPlacements[placement] ??= [];
      adsByPlacements[placement].push(ad);
    });
  });

  const response: RawAdsResponse = {
    sponsoredProducts: adsByPlacements,
    stories: toStoriesByPlacements(getStoryArray(adResponse)),
    banners: undefined,
    sponsoredBrands: undefined,
  };

  return response;
};

/**
 * Fetches and enriches ad offers with corresponding product details.
 *
 * This function retrieves ads, fetches product information to enrich these ads
 * and then return the search result with the advertisement data.
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
  const adServerArgs = toAdServerArgs(args);
  const adResponse = await getAds(
    args.identity.publisherId,
    adServerArgs,
    options,
  );
  const ads = getSponsoredProductArray(adResponse);

  // Nothing to hydrate (no sponsored products, as with Stories only): no
  // product request, so its failure can't lose the Stories.
  const offers = buildOffers(ads);
  const products =
    offers.length > 0
      ? await fetcher(offers, args.identity, { signal: options?.signal })
      : [];

  const mergedResult = mergeAdsWithProducts<T>(products, ads, matcher);

  const response: HydratedAdsResponse<T> = {
    sponsoredProducts: mergedResult,
    stories: toStoriesByPlacements(getStoryArray(adResponse)),
    banners: undefined,
    sponsoredBrands: undefined,
  };

  return response;
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

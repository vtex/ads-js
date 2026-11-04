import { getAds } from "./clients/adServer";
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
): StoriesByPlacements => Object.fromEntries(stories);

/**
 * Fetches raw advertisement data without enriching it with product details.
 *
 * @param args - Targeting arguments to fetch ads.
 * @returns RawAdsResponse - Sponsored products and Story ads, each grouped by
 * placement
 * @public
 */
export const getRawAds: (args: GetAdsArgs) => Promise<RawAdsResponse> = async (
  args,
) => {
  const adServerArgs = toAdServerArgs(args);
  const adResponse = await getAds(args.identity.publisherId, adServerArgs);
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
 * @returns hydratedAds The sponsored search result consisting of products that
 * are sponsored by the ad server.
 * @public
 */
export const getHydratedAds = async <T extends object>(
  args: GetAdsArgs,
  fetcher: ProductFetcher<T>,
  matcher: ProductMatchesOffer<T>,
): Promise<HydratedAdsResponse<T>> => {
  const adServerArgs = toAdServerArgs(args);
  const adResponse = await getAds(args.identity.publisherId, adServerArgs);
  const ads = getSponsoredProductArray(adResponse);

  const products = await fetcher(buildOffers(ads), args.identity);

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
 * @returns Promise resolving to hydrated ads response using Intelligent Search
 * @public
 */
export const getHydratedAdsByIS = (
  args: GetAdsArgs,
): Promise<HydratedAdsResponse<Product>> => {
  return getHydratedAds(
    args,
    intelligentSearchFetcher,
    intelligentSearchMatcher,
  );
};

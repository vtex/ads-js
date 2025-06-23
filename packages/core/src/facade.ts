import { getAds } from "./clients/adServer";
import { getSponsoredProductArray } from "./clients/adServer/mappers";
import { Product } from "./clients/search";
import { mergeAdsWithProducts } from "./hydration/mergeAdsWithProducts";
import { fetchWithIS } from "./hydration/intelligentSearchFetcher/fetchWithIS";
import { searchProductMatchesOffer } from "./hydration/intelligentSearchFetcher/productMatchesISSku";
import {
  HydratedAdsResponse,
  ProductFetcher,
  ProductMatchesOffer,
} from "./hydration/types";
import { GetAdsArgs, RawAdsByPlacements, RawAdsResponse } from "./types";
import { toAdServerArgs } from "./utils/toAdServerArgs";

/**
 * Fetches raw advertisement data without enriching it with product details.
 *
 * @param args - Targeting arguments to fetch ads.
 * @returns RawAdsResponse - An object where each key is a placement and the
 * value is an array of sponsored products
 */
export const getRawAds: (_: GetAdsArgs) => Promise<RawAdsResponse> = async (
  args,
) => {
  const adServerArgs = toAdServerArgs(args);
  const adsArray = getSponsoredProductArray(
    await getAds(args.identity.publisherId, adServerArgs),
  );

  const adsByPlacements = {} as RawAdsByPlacements;

  adsArray.forEach(([placement, ads]) => {
    ads.forEach((ad) => {
      adsByPlacements[placement] ??= [];
      adsByPlacements[placement].push(ad);
    });
  });

  const response: RawAdsResponse = {
    sponsoredProducts: adsByPlacements,
    banners: undefined,
    sponsoredBrands: undefined,
  };

  return response;
};

/**
 * Fetches and enriches advertisement data with corresponding product details.
 *
 * This function retrieves ads, fetches product information to enrich these ads
 * and then return the search result with the advertisement data.
 *
 * @param args - Targeting arguments to fetch ads.
 * @returns hydratedAds The sponsored search result consisting of products that
 * are sponsored by the ad server.
 */
export const getHydratedAds = async <T extends object>(
  args: GetAdsArgs,
  fetchProducts: ProductFetcher<T>,
  productMatchesOffer: ProductMatchesOffer<T>,
): Promise<HydratedAdsResponse<T>> => {
  const adServerArgs = toAdServerArgs(args);
  const ads = getSponsoredProductArray(
    await getAds(args.identity.publisherId, adServerArgs),
  );

  const products = await fetchProducts(ads, args.identity);

  const mergedResult = mergeAdsWithProducts<T>(
    products,
    ads,
    productMatchesOffer,
  );

  const response: HydratedAdsResponse<T> = {
    sponsoredProducts: mergedResult,
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
 */
export const getISHydratedAdsUncached = (
  args: GetAdsArgs,
): Promise<HydratedAdsResponse<Product>> => {
  return getHydratedAds(args, fetchWithIS, searchProductMatchesOffer);
};

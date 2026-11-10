import { getOffer, getStoryOffer } from "../clients/adServer/mappers";
import { Identity } from "../types";
import { mapByPlacement } from "../utils/byPlacement";
import { buildHydratedStory, offersOf, productFinder } from "./mappers";
import { mergeAdsWithProducts } from "./mergeAdsWithProducts";
import {
  AdsToHydrate,
  HydratedAds,
  ProductFetcher,
  ProductFetcherOptions,
  ProductMatchesOffer,
} from "./types";

/**
 * Enriches ads already fetched, as by `getRawAds`, with their products:
 * the sponsored products and the Stories' products, in one fetcher call.
 *
 * Both come with the same `advertisement` (event URLs and parameters) and,
 * when found, `product`. Sponsored products the fetcher doesn't find go to
 * `failed`, as in `getHydratedAds`. Stories are all kept, in their order,
 * each under `story` as the ad server sent it: those not found (link
 * Stories included) come without `product`.
 *
 * Calls the fetcher only when there is a product to find. A fetcher
 * failure, or a cancelled request, rejects: the caller decides what to show
 * without the products, for example the ads as `getRawAds` returned them.
 *
 * @param ads - Ads to hydrate, as `getRawAds` returns them.
 * @param fetcher - Function to fetch product details from given offers.
 * @param matcher - Function to match products with offers.
 * @param identity - Identity passed to the fetcher, as in the ad request.
 * @param options - Request options for the fetcher, such as a signal to
 * cancel it.
 * @returns The ads with their products.
 * @public
 */
export const hydrateAds = async <T extends object>(
  { sponsoredProducts = {}, stories = {} }: AdsToHydrate,
  fetcher: ProductFetcher<T>,
  matcher: ProductMatchesOffer<T>,
  identity: Identity,
  options?: ProductFetcherOptions,
): Promise<HydratedAds<T>> => {
  const offers = [
    ...offersOf(sponsoredProducts, getOffer),
    ...offersOf(stories, getStoryOffer),
  ];

  const products =
    offers.length > 0
      ? await fetcher(offers, identity, { signal: options?.signal })
      : [];
  const findProduct = productFinder(products, matcher);

  return {
    sponsoredProducts: mergeAdsWithProducts(sponsoredProducts, findProduct),
    stories: mapByPlacement(stories, (story) =>
      buildHydratedStory(story, findProduct),
    ),
  };
};

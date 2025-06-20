import { getAds } from "./clients/adServer";
import {
  AdsByPlacement,
  getSkuIds,
  getSponsoredProductArray,
} from "./clients/adServer/mappers";
import { getProductsBySkuId } from "./clients/search";
import { Product } from "./clients/search/types";
import {
  RawAdsResponse,
  RawAdsByPlacements,
  HydratedProductsByPlacements,
  HydratedAdsResponse,
  GetAdsArgs,
} from "./types";
import { atob } from "./utils/base64";
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
 * Add advertisement data to the products.
 *
 * Also filters the SKUs inside products to only include the one that is
 * sponsored.
 *
 * @internal
 * @param products - Array of products to be enriched with ad data.
 * @param adsByPlacements - Array of ads grouped by placement.
 * @returns HydratedProductsByPlacements - An object where each key is a
 * placement and the value is an array of products enriched with ad metadata.
 */
const mergeProductsAndAds = (
  products: Product[],
  adsByPlacements: AdsByPlacement[],
) => {
  const response: HydratedProductsByPlacements = {};

  for (const [placement, ads] of adsByPlacements) {
    for (const ad of ads) {
      for (const product of products) {
        if (product.items.find((sku) => sku.itemId === ad.product_sku)) {
          response[placement] ??= [];

          response[placement].push({
            ...product,
            adMetadata: {
              eventUrls: {
                click: ad.click_url,
                impression: ad.impression_url,
                view: ad.view_url,
              },
              eventParameters: atob(ad.impression_url),
              sponsorSellerId: ad.seller_id,
            },
          });
        }
      }
    }
  }

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
export const getHydratedAds: (
  _: GetAdsArgs,
) => Promise<HydratedAdsResponse> = async (args) => {
  const adServerArgs = toAdServerArgs(args);
  const ads = getSponsoredProductArray(
    await getAds(args.identity.publisherId, adServerArgs),
  );
  const adsSkuIds = getSkuIds(ads);

  const searchProduct = await getProductsBySkuId(
    args.identity.publisherId,
    adsSkuIds,
  );
  const products = searchProduct.products;
  const hydratedAds = mergeProductsAndAds(products, ads);

  const response: HydratedAdsResponse = {
    sponsoredProducts: hydratedAds,
    banners: undefined,
    sponsoredBrands: undefined,
  };

  return response;
};

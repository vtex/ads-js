import { Placement, SponsoredProductDetail } from "../clients/adServer";
import { HydratedSponsoredProduct, Offer, ProductMatchesOffer } from "./types";

export const buildHydratedProduct = <T extends object>(
  product: T,
  ad: SponsoredProductDetail,
  sponsoredOffer: Offer,
): HydratedSponsoredProduct<T> => ({
  product,
  advertisement: {
    eventUrls: {
      click: ad.click_url,
      impression: ad.impression_url,
      view: ad.view_url,
    },
    eventParameters: btoa(ad.impression_url),
    sponsoredBySellerId: sponsoredOffer.sellerId,
  },
});

/**
 * The offers of the ads of any type, in order. Ads without one (as link
 * Stories) are skipped.
 */
export const offersOf = <Ad>(
  ads: Record<Placement, Ad[]>,
  toOffer: (ad: Ad) => Offer | undefined,
): Offer[] =>
  Object.values(ads)
    .flatMap((placementAds) => placementAds.map((ad) => toOffer(ad)))
    .filter((offer) => offer !== undefined);

/**
 * Finds an offer's product among the fetched ones. Undefined without an
 * offer or without a match.
 */
export type ProductFinder<T> = (offer: Offer | undefined) => T | undefined;

export const productFinder =
  <T>(products: T[], matcher: ProductMatchesOffer<T>): ProductFinder<T> =>
  (offer) =>
    offer && products.find((product) => matcher(product, offer));

import {
  Placement,
  SponsoredProductDetail,
  StoryAdDetail,
} from "../clients/adServer";
import { getStoryOffer } from "../clients/adServer/mappers";
import {
  Advertisement,
  HydratedSponsoredProduct,
  HydratedStory,
  Offer,
  ProductMatchesOffer,
} from "./types";

type TrackedAd = Pick<
  SponsoredProductDetail,
  "click_url" | "impression_url" | "view_url"
>;

export const buildAdvertisement = (
  ad: TrackedAd,
  sellerId?: string,
): Advertisement => ({
  eventUrls: {
    click: ad.click_url,
    impression: ad.impression_url,
    view: ad.view_url,
  },
  eventParameters: btoa(ad.impression_url),
  sponsoredBySellerId: sellerId,
});

export const buildHydratedProduct = <T extends object>(
  product: T,
  ad: SponsoredProductDetail,
  sponsoredOffer: Offer,
): HydratedSponsoredProduct<T> => ({
  product,
  advertisement: buildAdvertisement(ad, sponsoredOffer.sellerId),
});

/**
 * A Story with its advertisement data, its product's offer and, when found,
 * its product. The seller is the offer's, or the Story's for a link Story.
 */
export const buildHydratedStory = <T extends object>(
  story: StoryAdDetail,
  findProduct: ProductFinder<T>,
): HydratedStory<T> => {
  const offer = getStoryOffer(story);
  return {
    story,
    product: findProduct(offer),
    offer,
    advertisement: buildAdvertisement(
      story,
      offer?.sellerId ?? story.seller_id,
    ),
  };
};

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

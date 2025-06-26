import { SponsoredProductDetail } from "../clients/adServer";
import { AdsByPlacement } from "../clients/adServer/mappers";
import { HydratedSponsoredProduct, Offer } from "./types";
import { getOffer } from "../clients/adServer/mappers";

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

export const buildOffers = (ads: AdsByPlacement[]): Offer[] =>
  ads.flatMap(([_, ad]) => ad).map((ad) => getOffer(ad));

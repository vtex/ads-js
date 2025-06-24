import { SponsoredProductDetail } from "../clients/adServer";
import { AdsByPlacement } from "../clients/adServer/mappers";
import { HydratedSponsoredProduct, Offer } from "./types";

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
  ads
    .flatMap(([_, ad]) => ad)
    .map((ad) => ({
      productId: ad.product_metadata?.productId || "",
      skuId: ad.product_sku,
      sellerId: ad.seller_id || "",
    }));

import { Placement, SponsoredProductDetail } from "../clients/adServer";
import { Identity } from "../types";

export type SkuId = string;
export type SellerId = string;

export type Offer = {
  skuId: string;
  sellerId: string;
  productId: string;
};

export type OffersMap = Map<SkuId, SellerId[]>;

export type ProductMatchesOffer<TProduct> = (
  product: TProduct,
  offer: Offer,
) => boolean;

export type ProductFetcher<TProduct extends object> = (
  offers: Offer[],
  identity: Identity,
) => Promise<TProduct[]>;

export interface HydratedProductsResult<T> {
  byPlacement: HydratedProductsByPlacements<T>;
  failed: SponsoredProductDetail[];
}

export type HydratedProductsByPlacements<T> = Record<
  Placement,
  HydratedSponsoredProduct<T>[]
>;

export interface HydratedSponsoredProduct<T> {
  product: T;
  advertisement: {
    eventUrls: {
      click: string;
      impression: string;
      view: string;
    };
    // Base64 encoded string containing event parameters, used by
    // Activity Flow tracking.
    eventParameters: string;
    sponsoredBySellerId?: string;
  };
}

export interface HydratedAdsResponse<T> {
  sponsoredProducts: HydratedProductsResult<T>;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
}

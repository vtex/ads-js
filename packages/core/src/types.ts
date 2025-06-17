import {
  Channel,
  PlacementBody,
  SponsoredProductDetail,
} from "./clients/adServer";
import { Product } from "./clients/search/types";

export interface HydratedSponsoredProduct extends Product {
  adMetadata: {
    eventUrls: {
      click: string;
      impression: string;
      view: string;
    };
    // Base64 encoded string containing event parameters, used by
    // Activity Flow tracking.
    eventParameters: string;
    sponsorSellerId?: string;
  };
}

export type Placement = string;
export type HydratedProductsByPlacements = Record<
  Placement,
  HydratedSponsoredProduct[]
>;

export type HydratedAdsResponse = {
  sponsoredProducts: HydratedProductsByPlacements;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
};

export type RawAdsByPlacements = Record<Placement, SponsoredProductDetail[]>;

export type RawAdsResponse = {
  sponsoredProducts: RawAdsByPlacements;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
};

export interface Facet {
  key: string;
  value: string;
}

export interface GetAdsArgs {
  identity: {
    publisherId: string;
    userId: string;
    sessionId: string;
    channel?: Channel;
  };
  search: {
    selectedFacets?: Facet[];
    term?: string;
    skuId?: string;
  }
  placements: Record<Placement, PlacementBody>;
}

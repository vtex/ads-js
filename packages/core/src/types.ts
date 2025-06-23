import {
  Channel,
  Placement,
  PlacementBody,
  SponsoredProductDetail,
} from "./clients/adServer";

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

export interface Identity {
  accountName: string;
  publisherId: string;
  userId: string;
  sessionId: string;
  channel?: Channel;
}

export interface GetAdsArgs {
  identity: Identity;
  search: {
    selectedFacets?: Facet[];
    term?: string;
    skuId?: string;
  };
  placements: Record<Placement, PlacementBody>;
}

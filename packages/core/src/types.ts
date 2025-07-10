import {
  Channel,
  Placement,
  PlacementBody,
  SponsoredProductDetail,
} from "./clients/adServer";

/**
 * Record of raw sponsored products grouped by placement
 * @public
 */
export type RawAdsByPlacements = Record<Placement, SponsoredProductDetail[]>;

/**
 * Response object containing raw advertisements data
 * @public
 */
export type RawAdsResponse = {
  sponsoredProducts: RawAdsByPlacements;
  // TODO: implement other ad responses.
  banners: void;
  sponsoredBrands: void;
};

/**
 * Facet used for filtering search results
 * @public
 */
export interface Facet {
  key: string;
  value: string;
}

/**
 * Identity information for ad requests
 * @public
 */
export interface Identity {
  accountName: string;
  publisherId: string;
  userId: string;
  sessionId: string;
  channel?: Channel;
}

/**
 * Arguments for getting advertisements
 * @public
 */
export interface GetAdsArgs {
  identity: Identity;
  search: {
    selectedFacets?: Facet[];
    term?: string;
    skuId?: string;
  };
  placements: Record<Placement, PlacementBody>;
}

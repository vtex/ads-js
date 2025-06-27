import type * as SearchTypes from "./clients/search/types";

export type Search = {
  SearchResponse: SearchTypes.SearchResponse;
  Correction: SearchTypes.Correction;
  Options: SearchTypes.Options;
  Pagination: SearchTypes.Pagination;
  Current: SearchTypes.Current;
  First: SearchTypes.First;
  Product: SearchTypes.Product;
  ClusterHighlight: SearchTypes.ClusterHighlight;
  Item: SearchTypes.Item;
  Image: SearchTypes.Image;
  ReferenceID: SearchTypes.ReferenceID;
  Seller: SearchTypes.Seller;
  CommertialOffer: SearchTypes.CommertialOffer;
  Installment: SearchTypes.Installment;
  Teaser: SearchTypes.Teaser;
  Conditions: SearchTypes.Conditions;
  Parameter: SearchTypes.Parameter;
  Effects: SearchTypes.Effects;
  Variation: SearchTypes.Variation;
  PriceRange: SearchTypes.PriceRange;
  Price: SearchTypes.Price;
  Property: SearchTypes.Property;
  SkuSpecification: SearchTypes.SkuSpecification;
  Field: SearchTypes.Field;
  SpecificationGroup: SearchTypes.SpecificationGroup;
};

import type * as AdServerTypes from "./clients/adServer/types";

export type AdServer = {
  Channel: AdServerTypes.Channel;
  NavigationContext: AdServerTypes.NavigationContext;
  Placement: AdServerTypes.Placement;
  AdType: AdServerTypes.AdType;
  PlacementBody: AdServerTypes.PlacementBody;
  AdRequest: AdServerTypes.AdRequest;
  SponsoredProductDetail: AdServerTypes.SponsoredProductDetail;
  SponsoredBrandDetail: AdServerTypes.SponsoredBrandDetail;
  AdsDetail: AdServerTypes.AdsDetail;
  AdResponse: AdServerTypes.AdResponse;
  AdResponseWithError: AdServerTypes.AdResponseWithError;
};

export { getRawAds, getHydratedAds, getISHydratedAdsUncached } from "./facade";
export { fetchWithIS } from "./hydration/intelligentSearchFetcher/fetchWithIS";
export { searchProductMatchesOffer } from "./hydration/intelligentSearchFetcher/searchProductMatchesOffer";

export {
  RawAdsByPlacements,
  RawAdsResponse,
  Facet,
  Identity,
  GetAdsArgs,
} from "./types";
export { ProductFetcher, ProductMatchesOffer } from "./hydration/types";

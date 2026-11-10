export { getRawAds, getHydratedAds, getHydratedAdsByIS } from "./facade";
export { hydrateAds } from "./hydration/hydrateAds";
export {
  intelligentSearchFetcher,
  intelligentSearchMatcher,
  intelligentSearchPrice,
  intelligentSearchAvailability,
} from "./hydration/intelligentSearch";

export type {
  RawAdsByPlacements,
  RawAdsResponse,
  StoriesByPlacements,
  Facet,
  Identity,
  GetAdsArgs,
} from "./types";
export type {
  ProductFetcher,
  ProductFetcherOptions,
  ProductPrice,
  ProductPriceReader,
  ProductAvailabilityReader,
  ProductMatchesOffer,
  HydratedSponsoredProduct,
  HydratedAdsResponse,
  HydratedProductsResult,
  HydratedProductsByPlacements,
  HydratedStory,
  Advertisement,
  HydratedStoriesByPlacements,
  HydratedAds,
  AdsToHydrate,
  Offer,
} from "./hydration/types";
export type {
  SponsoredProductDetail,
  StoryAdDetail,
  StoryProduct,
  Channel,
  Placement,
  PlacementBody,
  AdType,
} from "./clients/adServer/types";
export type { GetAdsOptions } from "./clients/adServer";
export type {
  Product,
  PriceRange,
  SpecificationGroup,
  SkuSpecification,
  ClusterHighlight,
  Property,
  Item,
  Seller,
  Image,
  ReferenceID,
  Variation,
  Price,
  Field,
  CommertialOffer,
  Installment,
  Teaser,
  Conditions,
  Effects,
  Parameter,
} from "./clients/search/types";

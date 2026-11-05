export { getRawAds, getHydratedAds, getHydratedAdsByIS } from "./facade";
export {
  intelligentSearchFetcher,
  intelligentSearchMatcher,
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
  ProductMatchesOffer,
  HydratedSponsoredProduct,
  HydratedAdsResponse,
  HydratedProductsResult,
  HydratedProductsByPlacements,
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

export { getRawAds, getHydratedAds, getISHydratedAdsUncached } from "./facade";
export { fetchWithIS } from "./hydration/intelligentSearchFetcher/fetchWithIS";
export { searchProductMatchesOffer } from "./hydration/intelligentSearchFetcher/searchProductMatchesOffer";

export type {
  RawAdsByPlacements,
  RawAdsResponse,
  Facet,
  Identity,
  GetAdsArgs,
} from "./types";
export type { ProductFetcher, ProductMatchesOffer } from "./hydration/types";

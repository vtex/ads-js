export * from "./clients/search/types";
export * from "./clients/adServer/types";

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

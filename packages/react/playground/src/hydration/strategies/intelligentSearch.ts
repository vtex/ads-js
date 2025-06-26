import { fetchWithIS, searchProductMatchesOffer } from "@vtex/ads-core";
import { HydrationStrategy } from "../types";

export const intelligentSearchStrategy: HydrationStrategy = {
  name: "Intelligent Search",
  fetcher: fetchWithIS,
  matcher: searchProductMatchesOffer,
};

import { fetchWithIS, searchProductMatchesOffer } from "@vtex/ads-core";
import { HydrationStrategy } from "../types";
import { Product } from "@vtex/ads-core/search";

export const intelligentSearchStrategy: HydrationStrategy<Product> = {
  name: "Intelligent Search",
  fetcher: fetchWithIS,
  matcher: searchProductMatchesOffer,
};

import { ProductFetcher } from "@vtex/ads-core";
import { SimpleMockProduct, HydrationStrategy } from "../types";
import { mockMatcher } from "./mock";

// Error-prone mock fetcher that sometimes throws errors
export const errorProneMockFetcher: ProductFetcher<
  SimpleMockProduct
> = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Throw an error to showcase error handling
  throw new Error(
    "Mock API failure: Simulated network timeout or server error",
  );
};

export const errorProneMockStrategy: HydrationStrategy<SimpleMockProduct> = {
  name: "Error-Prone Mock (API Failures)",
  fetcher: errorProneMockFetcher,
  matcher: mockMatcher,
};

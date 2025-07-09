// Export types
export type { SimpleMockProduct, HydrationStrategy } from "./types";

// Export individual strategies
export { intelligentSearchStrategy } from "./strategies/intelligentSearch";
export { mockStrategy } from "./strategies/mock";
export { unreliableMockStrategy } from "./strategies/unreliableMock";
export { errorProneMockStrategy } from "./strategies/errorProneMock";

// Import strategies for the combined export
import { intelligentSearchStrategy } from "./strategies/intelligentSearch";
import { mockStrategy } from "./strategies/mock";
import { unreliableMockStrategy } from "./strategies/unreliableMock";
import { errorProneMockStrategy } from "./strategies/errorProneMock";

// Combined strategies object
export const hydrationStrategies = {
  intelligentSearch: intelligentSearchStrategy,
  mocked: mockStrategy,
  unreliableMock: unreliableMockStrategy,
  errorProneMock: errorProneMockStrategy,
} as const;

export type HydrationStrategyKey = keyof typeof hydrationStrategies;

// Default exports for backward compatibility
export {
  intelligentSearchFetcher,
  intelligentSearchMatcher,
} from "@vtex/ads-core";

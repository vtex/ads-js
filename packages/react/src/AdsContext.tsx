import { createContext } from "react";

import type { Channel } from "@vtex/ads-core/adServer";
import type { ProductFetcher, ProductMatchesOffer } from "@vtex/ads-core";

/**
 * Type for the ads context value
 * @public
 */
export interface AdsContextType<TProduct extends object> {
  identity: {
    accountName: string;
    publisherId: string;
    userId?: string;
    sessionId: string;
    channel?: Channel;
  };
  hydrationStrategy: {
    fetcher: ProductFetcher<TProduct>;
    matcher: ProductMatchesOffer<TProduct>;
    key?: string;
  };
}

// Ensure a cross-bundle singleton so different apps that depend on
// @vtex/ads-react share the same React Context instance.
// This avoids provider/consumer mismatches when separate bundles import
// their own copies of this package.
const globalObject: Record<string | symbol, unknown> =
  (typeof globalThis !== "undefined" && (globalThis as unknown as object))
    ? (globalThis as unknown as Record<string | symbol, unknown>)
    : (typeof window !== "undefined"
      ? (window as unknown as Record<string | symbol, unknown>)
      : (typeof global !== "undefined"
        ? (global as unknown as Record<string | symbol, unknown>)
        : {}));

const ADS_CONTEXT_SINGLETON_KEY = Symbol.for("vtex.ads.react.context");

const existingContext = globalObject[
  ADS_CONTEXT_SINGLETON_KEY
] as ReturnType<
  typeof createContext<AdsContextType<object> | undefined>
> | undefined;

export const AdsContext =
  existingContext ??
  (function createAndStore() {
    const ctx = createContext<AdsContextType<object> | undefined>(undefined);
    globalObject[ADS_CONTEXT_SINGLETON_KEY] = ctx;
    return ctx;
  })();

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
    userId: string;
    sessionId: string;
    channel?: Channel;
  };
  hydrationStrategy: {
    fetcher: ProductFetcher<TProduct>;
    matcher: ProductMatchesOffer<TProduct>;
    key?: string;
  };
}

export const AdsContext = createContext<AdsContextType<object> | undefined>(
  undefined,
);

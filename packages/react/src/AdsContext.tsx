import { ProductFetcher, ProductMatchesOffer, Channel } from "@vtex/ads-core";
import { createContext } from "react";

export interface AdsContextType<TProduct extends object> {
  accountName: string;
  publisherId: string;
  userId: string;
  sessionId: string;
  channel?: Channel;
  hydrationStrategy: {
    fetcher: ProductFetcher<TProduct>;
    matcher: ProductMatchesOffer<TProduct>;
    key?: string;
  };
}

export const AdsContext = createContext<AdsContextType<object> | undefined>(
  undefined,
);

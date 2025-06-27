import { Channel, ProductFetcher, ProductMatchesOffer } from "@vtex/ads-core";
import { createContext } from "react";

export interface AdsContextType<TProduct extends UnknownProduct> {
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

export type UnknownProduct = Record<string, unknown>;

export const AdsContext = createContext<
  AdsContextType<UnknownProduct> | undefined
>(undefined);

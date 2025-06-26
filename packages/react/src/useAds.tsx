import { getHydratedAds } from "@vtex/ads-core";
import type {
  AdType,
  GetAdsArgs,
  Placement,
  SponsoredProductDetail,
} from "@vtex/ads-core";
import { Facet } from "@vtex/ads-core";
import { useContext, useEffect, useState } from "react";
import { AdsContext } from "./AdsContext";

export interface UseAdsProps {
  placement: Placement;
  type: AdType;
  amount: number;
  term?: string;
  selectedFacets?: Facet[];
  skuId?: string;
}

interface UseAdsReturn {
  ads: unknown[]; // Replace with the actual type of ads returned
  failed: SponsoredProductDetail[]; // Ads that failed to be hydrated
  isLoading: boolean;
  error?: Error;
  refresh: () => void; // Function to trigger a fresh request
}

/**
 Call `useAds()` inside your component to request ads for a specific placement:

 ```ts
 const { ads, failed, isLoading, error } = useAds({
   placement: "search_top_product",
   type: "product",
   amount: 2,
   term: "tv",
 });
 ```
 */
export const useAds = ({
  placement,
  type,
  amount,
  term,
  selectedFacets,
  skuId,
}: UseAdsProps): UseAdsReturn => {
  const context = useContext(AdsContext);

  if (!context) {
    throw new Error("useAds must be used within an AdsProvider");
  }

  const args: GetAdsArgs = {
    identity: {
      accountName: context.accountName,
      publisherId: context.publisherId,
      userId: context.userId,
      sessionId: context.sessionId,
      channel: context.channel,
    },
    search: {
      selectedFacets,
      term,
      skuId,
    },
    placements: {
      [placement]: {
        quantity: amount,
        types: [type],
      },
    },
  };

  const selectedFacetsString = selectedFacets
    ? selectedFacets.map((facet) => `${facet.key}:${facet.value}`).join(", ")
    : "none";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [ads, setAds] = useState<UseAdsReturn["ads"]>([]);
  const [failed, setFailed] = useState<SponsoredProductDetail[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = () => {
    setRefreshCounter((prev) => (prev + 1) % 100);
  };

  useEffect(() => {
    setIsLoading(true);

    getHydratedAds(
      args,
      context.hydrationStrategy.fetcher,
      context.hydrationStrategy.matcher,
    )
      .then((response) => {
        setIsLoading(false);
        setAds(response.sponsoredProducts.byPlacement[placement] || []);
        setFailed(response.sponsoredProducts.failed || []);
        setError(undefined);
      })
      .catch((err) => {
        setAds([]);
        setFailed([]);
        setIsLoading(false);
        setError(err);
      });
  }, [
    placement,
    type,
    amount,
    term,
    selectedFacetsString,
    skuId,
    context.accountName,
    context.publisherId,
    context.hydrationStrategy.key,
    refreshCounter,
  ]);

  return {
    ads,
    failed,
    isLoading,
    error,
    refresh,
  };
};

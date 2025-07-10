import { getHydratedAds } from "@vtex/ads-core";
import { Facet } from "@vtex/ads-core";
import { useContext, useEffect, useState } from "react";

import type { GetAdsArgs, ProductFetcher } from "@vtex/ads-core";
import type { HydratedSponsoredProduct } from "@vtex/ads-core";
import type {
  AdType,
  Placement,
  SponsoredProductDetail,
} from "@vtex/ads-core/adServer";
import { AdsContext } from "./AdsContext";

/**
 * Props for the useAds hook
 * @public
 */
export interface UseAdsProps {
  placement: Placement;
  type: AdType;
  amount: number;
  term?: string;
  selectedFacets?: Facet[];
  skuId?: string;
}

/**
 * State object for ads data
 * @public
 */
export interface AdsState<TProduct extends object> {
  ads: HydratedSponsoredProduct<TProduct>[];
  failed: SponsoredProductDetail[];
  isLoading: boolean;
  error?: Error;
}

/**
 * Return type for the useAds hook
 * @public
 */
export interface UseAdsReturn<TProduct extends object>
  extends AdsState<TProduct> {
  refresh: () => void; // Function to trigger a fresh request
}

/**
 * Fetches and returns hydrated ads
 *
 * It must be used within an AdsProvider component, which supplies the
 * necessary context such as identity and hydration strategy.
 *
 * @param props - Configuration object for the ad request including
 * placement, type, amount, and optional search parameters
 *
 * @returns An object containing ads data, loading state, error
 * information, and refresh function
 *
 * @throws Will throw an error if used outside of an AdsProvider.
 *
 * @example
 * ```tsx
 * const \{ ads, isLoading, error, refresh \} = useAds(\{
 *   placement: "top",
 *   type: "product",
 *   amount: 3,
 *   term: "camiseta",
 *   selectedFacets: [\{ key: "brand", value: "Nike" \}],
 * \});
 * ```
 *
 * @public
 */
export function useAds<TProduct extends object>({
  placement,
  type,
  amount,
  term,
  selectedFacets,
  skuId,
}: UseAdsProps): UseAdsReturn<TProduct> {
  const context = useContext(AdsContext);

  if (!context) {
    throw new Error("useAds must be used within an AdsProvider");
  }

  const args: GetAdsArgs = {
    identity: context.identity,
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

  const [state, setState] = useState<AdsState<TProduct>>({
    ads: [],
    failed: [],
    isLoading: true,
    error: undefined,
  });

  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = () => {
    setRefreshCounter((prev) => (prev + 1) % 100);
  };

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    getHydratedAds<TProduct>(
      args,
      context.hydrationStrategy.fetcher as ProductFetcher<TProduct>,
      context.hydrationStrategy.matcher,
    )
      .then((response) => {
        setState({
          ads: response.sponsoredProducts.byPlacement[placement],
          failed: response.sponsoredProducts.failed || [],
          isLoading: false,
          error: undefined,
        });
      })
      .catch((err) => {
        setState({
          ads: [],
          failed: [],
          isLoading: false,
          error: err,
        });
      });
  }, [
    placement,
    type,
    amount,
    term,
    selectedFacetsString,
    skuId,
    context.identity.accountName,
    context.identity.publisherId,
    context.hydrationStrategy.key,
    refreshCounter,
  ]);

  return {
    ads: state.ads,
    failed: state.failed,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}

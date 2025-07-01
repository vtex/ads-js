import { getHydratedAds } from "@vtex/ads-core";
import { Facet } from "@vtex/ads-core";
import { useContext, useEffect, useState } from "react";
import { AdsContext, BaseProduct } from "./AdsContext";

import type { GetAdsArgs } from "@vtex/ads-core";
import type { HydratedSponsoredProduct } from "@vtex/ads-core";
import type {
  AdType,
  Placement,
  SponsoredProductDetail,
} from "@vtex/ads-core/adServer";

export interface UseAdsProps {
  placement: Placement;
  type: AdType;
  amount: number;
  term?: string;
  selectedFacets?: Facet[];
  skuId?: string;
}

export interface AdsState<TProduct extends BaseProduct> {
  ads: HydratedSponsoredProduct<TProduct>[];
  failed: SponsoredProductDetail[];
  isLoading: boolean;
  error?: Error;
}

export interface UseAdsReturn<TProduct extends BaseProduct>
  extends AdsState<TProduct> {
  refresh: () => void; // Function to trigger a fresh request
}

/**
 * Fetches and returns hydrated ads
 *
 * It must be used within an <AdsProvider> component, which supplies the
 * necessary context such as identity and hydration strategy.
 *
 * @param props - Configuration object for the ad request.
 * @param props.placement - The placement identifier (e.g. "top", "sidebar").
 * @param props.type - The type of ad to retrieve (e.g. "product").
 * @param props.amount - The number of ads to request for the given placement.
 * @param [props.term] - The search term used in the query (optional).
 * @param [props.selectedFacets] - The selected search filters (optional).
 * @param [props.skuId] - An optional SKU ID to contextualize the ad request.
 *
 * @returns An object containing:
 * - `ads`: The hydrated list of sponsored products for the given placement.
 * - `failed`: Any sponsored products that failed to hydrate with product data.
 * - `isLoading`: Whether the ads are currently being fetched.
 * - `error`: Any error that occurred during the request.
 * - `refresh`: A function to manually trigger a re-fetch of the ads.
 *
 * @throws Will throw an error if used outside of an AdsProvider.
 *
 * @example
 * const { ads, isLoading, error, refresh } = useAds({
 *   placement: "top",
 *   type: "product",
 *   amount: 3,
 *   term: "camiseta",
 *   selectedFacets: [{ key: "brand", value: "Nike" }],
 * });
 */
export const useAds = ({
  placement,
  type,
  amount,
  term,
  selectedFacets,
  skuId,
}: UseAdsProps): UseAdsReturn<BaseProduct> => {
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

  const [state, setState] = useState<AdsState<BaseProduct>>({
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

    getHydratedAds<BaseProduct>(
      args,
      context.hydrationStrategy.fetcher,
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
};

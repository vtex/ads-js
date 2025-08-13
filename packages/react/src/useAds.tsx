import { getHydratedAds } from "@vtex/ads-core";
import { Facet } from "@vtex/ads-core";
import { useContext, useEffect, useRef, useState } from "react";

import type { GetAdsArgs, ProductFetcher } from "@vtex/ads-core";
import type { HydratedSponsoredProduct } from "@vtex/ads-core";
import type {
  AdType,
  Placement,
  SponsoredProductDetail,
} from "@vtex/ads-core/adServer";
import { AdsContext } from "./AdsContext";
import { detectRuntimeEnv, logByRuntimeEnv } from "./utils/runtime";

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
  /**
   * When false, the hook will not request ads and will return
   * a no-op state. Defaults to true.
   */
  enabled?: boolean;
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
 * If used outside of an `AdsProvider`, this hook degrades gracefully and
 * returns a no-op result: empty ads, no error, not loading, and a noop refresh.
 *
 * @param props - Configuration object for the ad request including
 * placement, type, amount, and optional search parameters
 *
 * @returns An object containing ads data, loading state, error
 * information, and refresh function
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
  enabled = true,
}: UseAdsProps): UseAdsReturn<TProduct> {
  const context = useContext(AdsContext);

  const selectedFacetsString = selectedFacets
    ? selectedFacets.map((facet) => `${facet.key}:${facet.value}`).join(", ")
    : "none";

  const [state, setState] = useState<AdsState<TProduct>>({
    ads: [],
    failed: [],
    isLoading: Boolean(context) && enabled,
    error: undefined,
  });

  const [refreshCounter, setRefreshCounter] = useState(0);
  const hasWarnedNoProviderRef = useRef(false);
  const latestContextRef = useRef(context);
  // Keep a ref to the latest context to detect late-mounted providers
  latestContextRef.current = context;

  const refresh = () => {
    setRefreshCounter((prev) => (prev + 1) % 100);
  };

  useEffect(() => {
    if (!enabled) {
      setState({ ads: [], failed: [], isLoading: false, error: undefined });
      return;
    }

    if (!context) {
      // Defer the warning by a tick to allow late-mounted providers in
      // dynamically composed trees. Only warn if still missing.
      const timeoutId = setTimeout(() => {
        if (!hasWarnedNoProviderRef.current && !latestContextRef.current) {
          hasWarnedNoProviderRef.current = true;
          const env = detectRuntimeEnv();
          const message =
            "[vtex-ads-react] useAds was called without an AdsProvider. " +
            "Returning a no-op result. Wrap your tree with <AdsProvider>.";
          logByRuntimeEnv(message, env);
        }
      }, 0);

      setState({ ads: [], failed: [], isLoading: false, error: undefined });
      return () => clearTimeout(timeoutId);
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

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
    enabled,
    context?.identity?.accountName,
    context?.identity?.publisherId,
    context?.hydrationStrategy?.key,
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

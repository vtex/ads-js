import { useState, useEffect } from "react";
import { HydrationStrategyKey } from "../hydration";
import { Facet } from "@vtex/ads-core";
import { buildSelectedFacets } from "../utils/facets";

export interface PlaygroundConfig {
  accountName: string;
  publisherId: string;
  searchTerm: string;
  sponsoredCount: number;
  selectedFacets: Facet[];
  hydrationStrategy: HydrationStrategyKey;
}

export function usePlaygroundConfig() {
  // Initialize state with URL parameters
  const getInitialValues = (): PlaygroundConfig => {
    const params = new URLSearchParams(window.location.search);

    // Build initial facets from URL using utility function
    const facetFields = {
      categoryPath: params.get("categoryPath") || "",
      brand: params.get("brand") || "",
      productClusterId: params.get("productClusterId") || "",
    };

    return {
      accountName: params.get("accountName") || "",
      publisherId: params.get("publisherId") || "",
      searchTerm: params.get("searchTerm") || "",
      sponsoredCount: parseInt(params.get("sponsoredCount") || "4"),
      hydrationStrategy:
        (params.get("hydrationStrategy") as HydrationStrategyKey) ||
        "intelligentSearch",
      selectedFacets: buildSelectedFacets(facetFields),
    };
  };

  const [config, setConfig] = useState<PlaygroundConfig>(getInitialValues());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update URL when form values change
  useEffect(() => {
    console.log("useEffect config");
    const params = new URLSearchParams(window.location.search);

    // Update or remove App-level parameters
    if (config.accountName) {
      params.set("accountName", config.accountName);
    } else {
      params.delete("accountName");
    }

    if (config.publisherId) {
      params.set("publisherId", config.publisherId);
    } else {
      params.delete("publisherId");
    }

    if (config.searchTerm) {
      params.set("searchTerm", config.searchTerm);
    } else {
      params.delete("searchTerm");
    }

    if (config.sponsoredCount !== 4) {
      params.set("sponsoredCount", config.sponsoredCount.toString());
    } else {
      params.delete("sponsoredCount");
    }

    if (config.hydrationStrategy !== "intelligentSearch") {
      params.set("hydrationStrategy", config.hydrationStrategy);
    } else {
      params.delete("hydrationStrategy");
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [config]);

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      setConfig(getInitialValues());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => (prev + 1) % 100);
  };

  const hasRequiredConfig =
    config.accountName.trim() && config.publisherId.trim();

  return {
    config,
    setConfig,
    refreshTrigger,
    handleRefresh,
    hasRequiredConfig,
  };
}

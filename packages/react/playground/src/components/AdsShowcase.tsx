import React from "react";
import { AdsProvider } from "@vtex/ads-react";
import { TestAds } from "./TestAds";
import { hydrationStrategies } from "../hydration";
import { PlaygroundConfig } from "../hooks/usePlaygroundConfig";

interface AdsShowcaseProps {
  config: PlaygroundConfig;
  refreshTrigger: number;
}

export function AdsShowcase({ config, refreshTrigger }: AdsShowcaseProps) {
  const currentStrategy = hydrationStrategies[config.hydrationStrategy];

  return (
    <AdsProvider
      accountName={config.accountName}
      publisherId={config.publisherId}
      sessionId="session-123"
      userId="user-123"
      hydrationStrategy={{
        fetcher: currentStrategy.fetcher,
        matcher: currentStrategy.matcher,
        key: config.hydrationStrategy,
      }}
    >
      <TestAds
        searchTerm={config.searchTerm}
        sponsoredCount={config.sponsoredCount}
        selectedFacets={config.selectedFacets}
        strategyName={currentStrategy.name}
        refreshTrigger={refreshTrigger}
      />
    </AdsProvider>
  );
}

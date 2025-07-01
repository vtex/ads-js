import React from "react";
import { AdsProvider } from "@vtex/ads-react";
import { TestAds } from "./TestAds";
import { hydrationStrategies } from "../hydration";
import { PlaygroundConfig } from "../hooks/usePlaygroundConfig";
import {Channel} from "@vtex/ads-core/adServer";

interface AdsShowcaseProps {
  config: PlaygroundConfig;
  refreshTrigger: number;
}

export function AdsShowcase({ config, refreshTrigger }: AdsShowcaseProps) {
  const currentStrategy = hydrationStrategies[config.hydrationStrategy];

  return (
    <AdsProvider
      identity={{
        accountName: config.accountName,
        publisherId: config.publisherId,
        userId: "user-123",
        sessionId: "session-123",
        channel: "web" as Channel,
      }}
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

import React, { useState } from "react";
import { AdsProvider } from "@vtex/ads-react";
import { ConfigForm } from "./components/ConfigForm";
import { TestAds } from "./components/TestAds";
import { HydrationStrategyKey, hydrationStrategies } from "./hydration";
import { Facet } from "@vtex/ads-core";

export function App() {
  const [accountName, setAccountName] = useState("fastshopbr");
  const [publisherId, setPublisherId] = useState(
    "974b02b9-bfda-4a7c-ac10-2bd5b1d29a37",
  );
  const [searchTerm, setSearchTerm] = useState("tv");
  const [sponsoredCount, setSponsoredCount] = useState(4);
  const [selectedFacets, setSelectedFacets] = useState<Facet[]>([]);
  const [hydrationStrategy, setHydrationStrategy] =
    useState<HydrationStrategyKey>("intelligentSearch");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get the current strategy configuration
  const currentStrategy = hydrationStrategies[hydrationStrategy];

  return (
    <div className="min-h-screen bg-vtex-blue font-vtex">
      {/* Header with VTEX branding */}
      <header className="bg-white border-b border-vtex-gray-winter">
        <div className="vtex-container">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <img
                src="https://brand.vtex.com/wp-content/themes/vtex-brand/img/logo.svg"
                alt="VTEX Logo"
                className="h-8 w-auto"
              />
              <div className="h-8 w-px bg-vtex-gray-winter"></div>
              <div>
                <h1 className="text-2xl text-vtex-black font-normal">Ads</h1>
                <p className="text-sm text-vtex-gray -mt-1">
                  React SDK Playground
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-vtex-gray">
                The Enterprise Digital
              </p>
              <p className="text-sm text-vtex-pink font-medium -mt-1">
                Commerce Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="vtex-container">
        <div className="py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl text-vtex-black mb-2">
              Ads SDK Playground
            </h2>
            <p className="text-vtex-gray max-w-2xl">
              Configure and test VTEX Ads platform with different hydration
              strategies, search parameters, and facets. Experience how our
              React SDK integrates seamlessly with your commerce platform.
            </p>
          </div>

          {/* Configuration and Results */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ConfigForm
                accountName={accountName}
                publisherId={publisherId}
                searchTerm={searchTerm}
                sponsoredCount={sponsoredCount}
                selectedFacets={selectedFacets}
                hydrationStrategy={hydrationStrategy}
                onAccountNameChange={setAccountName}
                onPublisherIdChange={setPublisherId}
                onSearchTermChange={setSearchTerm}
                onSponsoredCountChange={setSponsoredCount}
                onSelectedFacetsChange={setSelectedFacets}
                onHydrationStrategyChange={setHydrationStrategy}
                onRefresh={() => setRefreshTrigger((prev) => (prev + 1) % 100)}
              />
            </div>

            <div>
              <AdsProvider
                accountName={accountName}
                publisherId={publisherId}
                sessionId="session-123"
                userId="user-123"
                hydrationStrategy={{
                  fetcher: currentStrategy.fetcher,
                  matcher: currentStrategy.matcher,
                  key: hydrationStrategy,
                }}
              >
                <TestAds
                  searchTerm={searchTerm}
                  sponsoredCount={sponsoredCount}
                  selectedFacets={selectedFacets}
                  strategyName={currentStrategy.name}
                  refreshTrigger={refreshTrigger}
                />
              </AdsProvider>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-vtex-gray-winter bg-white mt-12">
        <div className="vtex-container">
          <div className="py-6 flex items-center justify-between">
            <a className="flex items-center space-x-2" href="https://ads.vtex.com/">
              <span className="text-sm text-vtex-gray">Powered by</span>
              <span className="text-sm text-vtex-pink font-medium">
                VTEX Ads
              </span>
            </a>
            <div className="text-sm text-vtex-gray">
              Build amazing commerce experiences
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

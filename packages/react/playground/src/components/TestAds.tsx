import React from "react";
import JsonView from "@uiw/react-json-view";
import { useAds } from "../../../src";
import { Facet } from "@vtex/ads-core";

interface TestAdsProps {
  searchTerm: string;
  sponsoredCount: number;
  selectedFacets: Facet[];
  strategyName?: string;
  refreshTrigger?: number;
}

export function TestAds({
  searchTerm,
  sponsoredCount,
  selectedFacets,
  strategyName,
  refreshTrigger,
}: TestAdsProps) {
  const { ads, failed, isLoading, error, refresh } = useAds({
    placement: "home_top",
    type: "product",
    amount: sponsoredCount,
    term: searchTerm,
    selectedFacets: selectedFacets,
  });

  // Ref for the hydration sections
  const failedSectionRef = React.useRef<HTMLDivElement>(null);
  const successSectionRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to sections
  const scrollToSucessSection = (e) => {
    e.preventDefault();
    successSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToFailedSection = (e) => {
    e.preventDefault();
    failedSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Trigger refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger]);

  return (
    <div className="vtex-card">
      <div className="border-b border-vtex-gray-winter pb-4 mb-6">
        <h3 className="text-xl text-vtex-black mb-2">Ads Results</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-vtex-gray">
          {searchTerm && (
            <span className="px-2 py-1 bg-vtex-blue rounded-full">
              Term: "{searchTerm}"
            </span>
          )}
          {selectedFacets.length > 0 && (
            <span className="px-2 py-1 bg-vtex-pink-soft rounded-full">
              {selectedFacets.length} facet
              {selectedFacets.length > 1 ? "s" : ""}
            </span>
          )}
          {strategyName && (
            <span className="px-2 py-1 bg-vtex-gray-winter rounded-full">
              Strategy: {strategyName}
            </span>
          )}
        </div>
      </div>

      {/* Request Status */}
      {!isLoading && (
        <div className="mb-6">
          {error ? (
            <div className="border border-red-300 bg-red-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                  ❌
                </div>
                <div>
                  <h4 className="text-red-800 font-medium mb-1">
                    Request Failed
                  </h4>
                  <p className="text-red-700 text-sm mb-2">{error.message}</p>
                  <p className="text-red-600 text-xs">
                    This indicates a network error, authentication failure, or
                    server issue.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-green-300 bg-green-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5">
                  ✅
                </div>
                <div>
                  <h4 className="text-green-800 font-medium mb-1">
                    Request Successful
                  </h4>
                  <p className="text-green-700 text-sm mb-2">
                    Requested {sponsoredCount} ads, received{" "}
                    {ads.length + failed.length} from server
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hydration Summary */}
      {!isLoading && !error && (
        <div className="bg-vtex-blue border border-vtex-blue-soft rounded-lg p-4 mb-6">
          <h4 className="text-vtex-black font-medium mb-2">
            Hydration Summary
          </h4>
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="flex items-center space-x-2"
              onClick={scrollToSucessSection}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-vtex-black">{ads.length} successful</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2"
              onClick={scrollToFailedSection}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-vtex-black">{failed.length} failed</span>
            </a>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-vtex-pink border-t-transparent rounded-full animate-spin"></div>
            <span className="text-vtex-gray">Loading ads...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Successful Hydrated Ads */}
          <div
            ref={successSectionRef}
            className="bg-white border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <h4 className="text-green-700 font-medium">
                Hydrated Ads ({ads.length})
              </h4>
            </div>
            <div className="bg-vtex-gray-winter p-4 rounded-lg overflow-hidden">
              <JsonView
                value={ads}
                collapsed={3}
                style={{
                  backgroundColor: "transparent",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>

          {/* Failed Ads */}
          {failed.length > 0 && (
            <div
              ref={failedSectionRef}
              className="bg-white border border-red-200 rounded-lg p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <h4 className="text-red-700 font-medium">
                  Failed to Hydrate ({failed.length})
                </h4>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">
                  These ads were returned by the Ad Server but couldn't be
                  matched with product data. This usually means the product
                  doesn't exist in the catalog or the SKU/seller combination is
                  invalid.
                </p>
              </div>
              <div className="bg-vtex-gray-winter p-4 rounded-lg overflow-hidden">
                <JsonView
                  value={failed}
                  collapsed={4}
                  style={{
                    backgroundColor: "transparent",
                    fontSize: "12px",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

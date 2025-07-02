import React, { useState, useEffect } from "react";
import { HydrationStrategyKey, hydrationStrategies } from "../hydration";
import { buildSelectedFacets, getFacetFormFields } from "../utils/facets";
import { PlaygroundConfig } from "../hooks/usePlaygroundConfig";

interface ConfigFormProps {
  config: PlaygroundConfig;
  setConfig: React.Dispatch<React.SetStateAction<PlaygroundConfig>>;
  onRefresh?: () => void;
}

export function ConfigForm({ config, setConfig, onRefresh }: ConfigFormProps) {
  // Initialize local form fields from selectedFacets
  const getLocalInitialValues = () => getFacetFormFields(config.selectedFacets);

  // Local state for form inputs
  const [localAccountName, setLocalAccountName] = useState(config.accountName);
  const [localPublisherId, setLocalPublisherId] = useState(config.publisherId);
  const [localSearchTerm, setLocalSearchTerm] = useState(config.searchTerm);
  const [localSponsoredCount, setLocalSponsoredCount] = useState(
    config.sponsoredCount,
  );
  const [localHydrationStrategy, setLocalHydrationStrategy] = useState(
    config.hydrationStrategy,
  );

  // Facet inputs with URL initialization
  const localInitialValues = getLocalInitialValues();
  const [categoryPath, setCategoryPath] = useState(
    localInitialValues.categoryPath,
  );
  const [brand, setBrand] = useState(localInitialValues.brand);
  const [productClusterId, setProductClusterId] = useState(
    localInitialValues.productClusterId,
  );

  // Sync local state with props when they change (e.g., from URL changes)
  useEffect(() => {
    setLocalAccountName(config.accountName);
    setLocalPublisherId(config.publisherId);
    setLocalSearchTerm(config.searchTerm);
    setLocalSponsoredCount(config.sponsoredCount);
    setLocalHydrationStrategy(config.hydrationStrategy);
  }, [config]);

  // Update URL when local form fields change (only after user interaction)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {}, [
    categoryPath,
    brand,
    productClusterId,
    hasUserInteracted,
  ]);

  // Sync local facet fields when selectedFacets change (from URL navigation)
  useEffect(() => {
    const values = getLocalInitialValues();
    setCategoryPath(values.categoryPath);
    setBrand(values.brand);
    setProductClusterId(values.productClusterId);
  }, [config.selectedFacets]);

  const handleApplyChanges = () => {
    setConfig({
      accountName: localAccountName,
      publisherId: localPublisherId,
      searchTerm: localSearchTerm,
      sponsoredCount: localSponsoredCount,
      hydrationStrategy: localHydrationStrategy,
      selectedFacets: buildSelectedFacets({
        categoryPath,
        brand,
        productClusterId,
      }),
    });

    if (!hasUserInteracted) return; // Don't update URL during initialization

    const params = new URLSearchParams(window.location.search);

    if (categoryPath) {
      params.set("categoryPath", categoryPath);
    } else {
      params.delete("categoryPath");
    }

    if (brand) {
      params.set("brand", brand);
    } else {
      params.delete("brand");
    }

    if (productClusterId) {
      params.set("productClusterId", productClusterId);
    } else {
      params.delete("productClusterId");
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyChanges();
  };

  // Check if there are any unsaved changes
  const hasChanges =
    localAccountName !== config.accountName ||
    localPublisherId !== config.publisherId ||
    localSearchTerm !== config.searchTerm ||
    localSponsoredCount !== config.sponsoredCount ||
    localHydrationStrategy !== config.hydrationStrategy ||
    JSON.stringify(
      buildSelectedFacets({
        categoryPath,
        brand,
        productClusterId,
      }),
    ) !== JSON.stringify(config.selectedFacets);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ads Configuration Section */}
      <div className="vtex-card">
        <h3 className="text-xl text-vtex-black mb-6 border-b border-vtex-gray-winter pb-3">
          Platform Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Account Name
            </label>
            <input
              type="text"
              value={localAccountName}
              onChange={(e) => setLocalAccountName(e.target.value)}
              placeholder="Enter account name"
              className="vtex-input"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Publisher ID
            </label>
            <input
              type="text"
              value={localPublisherId}
              onChange={(e) => setLocalPublisherId(e.target.value)}
              placeholder="Enter publisher ID"
              className="vtex-input"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-vtex-black">
            Hydration Strategy
          </label>
          <select
            value={localHydrationStrategy}
            onChange={(e) =>
              setLocalHydrationStrategy(e.target.value as HydrationStrategyKey)
            }
            className="vtex-input"
          >
            {Object.entries(hydrationStrategies).map(([key, strategy]) => (
              <option key={key} value={key}>
                {strategy.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-vtex-gray">
            Choose how product data is retrieved and matched with ad data
          </p>
        </div>
      </div>

      {/* Search Parameters Section */}
      <div className="vtex-card border-l-4 border-l-vtex-pink">
        <h3 className="text-xl text-vtex-black mb-6 border-b border-vtex-gray-winter pb-3">
          Search Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Search Term
            </label>
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder="Enter search term (e.g., tv, smartphone)"
              className="vtex-input"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Sponsored Count
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={localSponsoredCount}
              onChange={(e) =>
                setLocalSponsoredCount(parseInt(e.target.value) || 1)
              }
              placeholder="Number of ads to request"
              className="vtex-input"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-vtex-black">
            Category Path
          </label>
          <input
            type="text"
            value={categoryPath}
            onChange={(e) => {
              setCategoryPath(e.target.value);
              setHasUserInteracted(true);
            }}
            placeholder="e.g., Electronics > Phones > Smartphones"
            className="vtex-input"
          />
          <p className="mt-2 text-xs text-vtex-gray">
            Use "&gt;" to separate category levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setHasUserInteracted(true);
              }}
              placeholder="e.g., Acme, Dunder Mifflin"
              className="vtex-input"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-vtex-black">
              Product Cluster ID
            </label>
            <input
              type="text"
              value={productClusterId}
              onChange={(e) => {
                setProductClusterId(e.target.value);
                setHasUserInteracted(true);
              }}
              placeholder="e.g., 123"
              className="vtex-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="vtex-button-primary"
            onClick={hasChanges ? undefined : onRefresh}
          >
            {hasChanges ? "🚀 Apply Changes" : "🔄 Refresh Ads"}
          </button>

          {hasChanges && (
            <div className="flex items-center space-x-2 text-vtex-pink">
              <div className="w-2 h-2 bg-vtex-pink rounded-full animate-pulse"></div>
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </div>

        {hasChanges && (
          <p className="mt-3 text-xs text-vtex-gray italic">
            Press Enter on any field or click "Query Hydrated Ads" to apply your
            configuration changes.
          </p>
        )}

        {/* Debug: Show current facets */}
        {(categoryPath || brand || productClusterId) && (
          <div className="mt-6 p-4 bg-vtex-blue rounded-lg border border-vtex-blue-soft">
            <h4 className="text-sm font-medium text-vtex-black mb-2">
              Current Facets Preview
            </h4>
            <pre className="text-xs text-vtex-gray overflow-x-auto">
              {JSON.stringify(
                buildSelectedFacets({
                  categoryPath,
                  brand,
                  productClusterId,
                }),
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </div>
    </form>
  );
}

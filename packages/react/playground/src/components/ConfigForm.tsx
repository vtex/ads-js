import React, { useState } from "react";
import { HydrationStrategyKey, hydrationStrategies } from "../hydration";
import { Facet } from "@vtex/ads-core";

interface ConfigFormProps {
  accountName: string;
  publisherId: string;
  searchTerm: string;
  sponsoredCount: number;
  selectedFacets: Facet[];
  hydrationStrategy: HydrationStrategyKey;
  onAccountNameChange: (value: string) => void;
  onPublisherIdChange: (value: string) => void;
  onSearchTermChange: (value: string) => void;
  onSponsoredCountChange: (value: number) => void;
  onSelectedFacetsChange: (value: Facet[]) => void;
  onHydrationStrategyChange: (value: HydrationStrategyKey) => void;
  onRefresh?: () => void;
}

export function ConfigForm({
  accountName,
  publisherId,
  searchTerm,
  sponsoredCount,
  selectedFacets,
  hydrationStrategy,
  onAccountNameChange,
  onPublisherIdChange,
  onSearchTermChange,
  onSponsoredCountChange,
  onSelectedFacetsChange,
  onHydrationStrategyChange,
  onRefresh,
}: ConfigFormProps) {
  // Local state for form inputs
  const [localAccountName, setLocalAccountName] = useState(accountName);
  const [localPublisherId, setLocalPublisherId] = useState(publisherId);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localSponsoredCount, setLocalSponsoredCount] =
    useState(sponsoredCount);
  const [localHydrationStrategy, setLocalHydrationStrategy] =
    useState(hydrationStrategy);

  // Facet inputs
  const [categoryPath, setCategoryPath] = useState("");
  const [brand, setBrand] = useState("");
  const [productClusterId, setProductClusterId] = useState("");

  const buildSelectedFacets = (): Facet[] => {
    const facets: Facet[] = [];

    // Handle category path: "Electronics > Phones > Smartphones" ->
    // multiple category facets
    if (categoryPath.trim()) {
      const categories = categoryPath
        .split(">")
        .map((cat) => cat.trim())
        .filter(Boolean);
      categories.forEach((category, index) => {
        facets.push({
          key: `category-${index + 1}`,
          value: category,
        });
      });
    }

    // Handle brand
    if (brand.trim()) {
      facets.push({
        key: "brand",
        value: brand.trim(),
      });
    }

    // Handle product cluster ID
    if (productClusterId.trim()) {
      facets.push({
        key: "productClusterIds",
        value: productClusterId.trim(),
      });
    }

    return facets;
  };

  const handleApplyChanges = () => {
    onAccountNameChange(localAccountName);
    onPublisherIdChange(localPublisherId);
    onSearchTermChange(localSearchTerm);
    onSponsoredCountChange(localSponsoredCount);
    onHydrationStrategyChange(localHydrationStrategy);
    onSelectedFacetsChange(buildSelectedFacets());

    // Trigger refresh to get fresh ads
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyChanges();
  };

  // Check if there are any unsaved changes
  const hasChanges =
    localAccountName !== accountName ||
    localPublisherId !== publisherId ||
    localSearchTerm !== searchTerm ||
    localSponsoredCount !== sponsoredCount ||
    localHydrationStrategy !== hydrationStrategy ||
    JSON.stringify(buildSelectedFacets()) !== JSON.stringify(selectedFacets);

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
            onChange={(e) => setCategoryPath(e.target.value)}
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
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Samsung, Apple"
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
              onChange={(e) => setProductClusterId(e.target.value)}
              placeholder="e.g., 123"
              className="vtex-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" className="vtex-button-primary">
            🚀 Query Hydrated Ads
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
              {JSON.stringify(buildSelectedFacets(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </form>
  );
}

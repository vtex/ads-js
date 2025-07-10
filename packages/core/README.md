# @vtex/ads-core

Core JavaScript SDK for requesting and managing VTEX Ads in any JavaScript environment. This package provides the fundamental advertising functionality with maximum flexibility and control, making it perfect for non-React applications or when you need custom integration patterns.

## Installation

```bash
npm install @vtex/ads-core
# or
yarn add @vtex/ads-core
```

## Basic Usage

### Getting Raw Ads

The simplest way to fetch ads is using `getRawAds()`:

```javascript
import { getRawAds } from "@vtex/ads-core";

const adRequest = {
  identity: {
    accountName: "your-account-name",
    publisherId: "your-publisher-id",
    userId: "user-123",
    sessionId: "session-456",
    channel: "web", // optional: 'web' | 'mobile'
  },
  search: {
    term: "smartphone", // optional search term
    selectedFacets: [
      // optional filters
      { key: "brand", value: "Acme" },
      { key: "category", value: "Tools" },
    ],
  },
  placements: {
    search_top_product: {
      quantity: 3,
      types: ["product"],
    },
  },
};

try {
  const rawAds = await getRawAds(adRequest);
  console.log("Raw ads:", rawAds.sponsoredProducts);
} catch (error) {
  console.error("Failed to fetch ads:", error);
}
```

### Getting Hydrated Ads

For a quick setup using VTEX's Intelligent Search, use the built-in hydration strategy:

```javascript
import { getHydratedAdsByIS } from "@vtex/ads-core";

const hydratedAds = await getHydratedAdsByIS(adRequest);
console.log("Hydrated ads:", hydratedAds.sponsoredProducts);
```

### Custom hydration

For ads enriched with product details, use `getHydratedAds()` with custom fetcher and matcher functions:

```javascript
import { getHydratedAds } from "@vtex/ads-core";

const customFetcher = async (offers, identity) => {
  // Your custom logic to fetch product details
  // Return array of products matching the offers
};

const customMatcher = (product, offer) => {
  // Your custom logic to match products with offers
  // Return true if product matches the offer
};

const hydratedAds = await getHydratedAds(
  adRequest,
  customFetcher,
  customMatcher,
);

console.log("Hydrated ads:", hydratedAds.sponsoredProducts);
```

## Key Concepts

- **Raw Ads**: Basic ad data from the Ad Server without product enrichment
- **Hydrated Ads**: Ads enriched with detailed product information
- **Fetcher**: Function that retrieves product details for ad offers
- **Matcher**: Function that determines if a product matches an ad offer
- **Placements**: Named locations where ads will be displayed

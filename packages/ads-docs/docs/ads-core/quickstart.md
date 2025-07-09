---
sidebar_position: 1
---

# Quickstart

The `@vtex/ads-core` package provides the fundamental advertising functionality for any JavaScript environment. This package is ideal when you're not using React or need maximum flexibility and control.

## Installation

Install the package using npm or yarn:

```bash
npm install @vtex/ads-core
# or
yarn add @vtex/ads-core
```

## Minimal Example

Here's a minimal example to get you started:

```javascript
import { getRawAds } from "@vtex/ads-core";

// Configure your ad request
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
    skuId: "SKU-123", // optional specific product
  },
  placements: {
    search_top_product: {
      quantity: 3,
      types: ["product"],
    },
  },
};

// Get raw ads
try {
  const rawAds = await getRawAds(adRequest);
  console.log("Raw ads:", rawAds.sponsoredProducts);
} catch (error) {
  console.error("Failed to fetch ads:", error);
}
```

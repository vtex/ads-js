---
sidebar_position: 1
---

# Introduction

The VTEX Ads SDK are JavaScript libraries designed to integrate VTEX's advertising platform into your storefront. It provides tools to request, fetch, and display sponsored products and banners with minimal effort.

The VTEX Ads SDK consists of two main packages:

- **`@vtex/ads-core`** - Core functionality for any JavaScript environment
- **`@vtex/ads-react`** - React-specific components and hooks

## Core Concepts

### Advertisement Types

The SDK supports different types of advertisements:

- **Sponsored Products** - Product listings with sponsored placement
- **Banners** - Display advertisements (coming soon)
- **Sponsored Brands** - Brand-focused advertisements (coming soon)

### Placements

Placements define where ads appear in your storefront:

- `search_top_product` - Top of search results
- `search_shelf_product` - Product shelf in search
- `home_top` - Homepage top section
- `home_shelf_product` - Homepage product shelf
- Or your custom placement, as defined on the [VTEX Ads platform](https://app.ads.vtex.com/).

### Hydration

A key concept in the VTEX Ads SDK is **hydration**, the process of enriching ad data with complete product information.

**Raw Ads** contain minimal information, such as product SKU, seller ID and advertisement metadata.

**Hydrated Ads** contain complete product data, such as:

- Product name, description, images
- Current pricing and availability
- Full product specifications
- Seller information

## Next Steps

- [Installing @vtex/ads-core](./ads-core/quickstart) - Learn how to use the core functionality for any JavaScript environment.
- [Installing @vtex/ads-react](./ads-react/quickstart) - Explore the React-specific components and hooks.

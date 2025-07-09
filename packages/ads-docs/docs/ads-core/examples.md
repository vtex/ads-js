# Examples

These examples demonstrate how to use the `getRawAds` function to fetch sponsored product placements based on different contexts in your storefront. Each use case shows how to build a request for the ad server using the user's identity and relevant search or category criteria, and then extract the returned sponsored products.

You can adapt these patterns to power your search results, category pages, homepage, and more — customizing placements, targeting, and quantity as needed.

## Simple Product Search

This example fetches ads for a search term, such as "smartphone", and retrieves sponsored products at the top of the search results.

```javascript
import { getRawAds } from "@vtex/ads-core";

async function getSearchAds(searchTerm, userId, sessionId) {
  const adRequest = {
    identity: {
      accountName: "mystore",
      publisherId: "pub-123",
      userId,
      sessionId,
    },
    search: {
      term: searchTerm,
    },
    placements: {
      search_top_product: {
        quantity: 4,
        types: ["product"],
      },
    },
  };

  try {
    const ads = await getRawAds(adRequest);
    return ads.sponsoredProducts.search_top_product || [];
  } catch (error) {
    console.error("Failed to fetch search ads:", error);
    return [];
  }
}

// Usage
const searchAds = await getSearchAds("smartphone", "user-123", "session-456");
```

## Category Page Ads

This example will fetch ads for a specific category, such as "electronics", for two placements: `category_top_product`, which represents sponsored products at the top of the result, and `category_shelf`, which is an additional shelf included at the category page.

```javascript
async function getCategoryAds(categoryId, userId, sessionId) {
  const adRequest = {
    identity: {
      accountName: "mystore",
      publisherId: "pub-123",
      userId,
      sessionId,
    },
    search: {
      selectedFacets: [{ key: "category", value: categoryId }],
    },
    placements: {
      category_top_product: {
        quantity: 3,
        types: ["product"],
      },
      category_shelf: {
        quantity: 8,
        types: ["product"],
      },
    },
  };

  const ads = await getRawAds(adRequest);
  return {
    topAds: ads.sponsoredProducts.category_top_product || [],
    shelfAds: ads.sponsoredProducts.category_shelf || [],
  };
}
```

## Homepage Ads

This will fetch ads for the homepage, including a top product placement and a shelf of products. This is useful for displaying featured products or promotions on the main page of your store.

```javascript
async function getHomepageAds(userId, sessionId) {
  const adRequest = {
    identity: {
      accountName: "mystore",
      publisherId: "pub-123",
      userId,
      sessionId,
    },
    search: {}, // No specific search criteria
    placements: {
      home_top_product: {
        quantity: 4,
        types: ["product"],
      },
      home_shelf_product: {
        quantity: 12,
        types: ["product"],
      },
    },
  };

  const ads = await getRawAds(adRequest);
  return {
    topProducts: ads.sponsoredProducts.home_top_product || [],
    shelfProducts: ads.sponsoredProducts.home_shelf_product || [],
  };
}
```

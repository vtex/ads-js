---
"@vtex/ads-core": minor
---

Add the Story ad type. Placements accept `types: ["story"]`, and `getRawAds`, `getHydratedAds` and `getHydratedAdsByIS` return the Story ads under `stories`, grouped by placement. New public types: `StoryAdDetail`, `StoryProduct` and `StoriesByPlacements`.

`getHydratedAds` and `getHydratedAdsByIS` no longer call the product fetcher when the response has no sponsored products to hydrate (for example, Stories only), so a failing product request no longer loses the Story ads.

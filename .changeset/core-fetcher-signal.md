---
"@vtex/ads-core": minor
---

`ProductFetcher` takes an optional third argument, `{ signal }`, to cancel the product request. `getHydratedAds` and `getHydratedAdsByIS` pass it the signal from their options, so one signal now cancels both the ad server request and the product request, and `intelligentSearchFetcher` cancels its Intelligent Search request with it. Fetchers that ignore the argument keep working as before.

---
"@vtex/ads-core": minor
---

`getRawAds`, `getHydratedAds` and `getHydratedAdsByIS` take an optional last argument, `{ signal }`, to cancel the ad server request with an `AbortSignal` (for example `AbortSignal.timeout(ms)` for a time limit). Without it, requests behave as before.

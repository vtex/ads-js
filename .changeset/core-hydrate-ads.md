---
"@vtex/ads-core": minor
---

New `hydrateAds(ads, fetcher, matcher, identity, options?)` enriches ads already fetched, as by `getRawAds`, with their products: the sponsored products and the Stories' products, in one fetcher call. Sponsored products not found go to `failed`. Every Story is kept, in its order, as `{ story, product?, offer?, advertisement }`: `story` is the ad as the ad server sent it, `product` is missing when the Story has none or it wasn't found, `offer` is the offer its product was searched with (missing for a link Story), and `advertisement` has the same shape (new `Advertisement` type) as a sponsored product's. It rejects when the fetcher fails, so the caller can still show the raw ads.

`getHydratedAds` and `getHydratedAdsByIS` now hydrate the Story ads too: they are `getRawAds` followed by `hydrateAds`, and `stories` is typed `HydratedStoriesByPlacements<T>`. A Story's product counts as a product to find, so a response with Stories now calls the fetcher, and a failing fetcher rejects the whole call. To show the Stories before their products, call `getRawAds` and then `hydrateAds`.

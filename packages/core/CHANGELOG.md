# @vtex/ads-core

## 0.6.0

### Minor Changes

- 6495795: `getRawAds`, `getHydratedAds` and `getHydratedAdsByIS` take an optional last argument, `{ signal }`, to cancel the ad server request with an `AbortSignal` (for example `AbortSignal.timeout(ms)` for a time limit). Without it, requests behave as before.
- 3261876: `ProductFetcher` takes an optional third argument, `{ signal }`, to cancel the product request. `getHydratedAds` and `getHydratedAdsByIS` pass it the signal from their options, so one signal now cancels both the ad server request and the product request, and `intelligentSearchFetcher` cancels its Intelligent Search request with it. Fetchers that ignore the argument keep working as before.
- 3261876: New `hydrateAds(ads, fetcher, matcher, identity, options?)` enriches ads already fetched, as by `getRawAds`, with their products: the sponsored products and the Stories' products, in one fetcher call. Sponsored products not found go to `failed`. Every Story is kept, in its order, as `{ story, product?, offer?, advertisement }`: `story` is the ad as the ad server sent it, `product` is missing when the Story has none or it wasn't found, `offer` is the offer its product was searched with (missing for a link Story), and `advertisement` has the same shape (new `Advertisement` type) as a sponsored product's. It rejects when the fetcher fails, so the caller can still show the raw ads, and as soon as its signal aborts, even when the fetcher ignores the signal (so does `getHydratedAds`).

  `getHydratedAds` and `getHydratedAdsByIS` now hydrate the Story ads too: they are `getRawAds` followed by `hydrateAds`, and `stories` is typed `HydratedStoriesByPlacements<T>`. A Story's product counts as a product to find, so a response with Stories now calls the fetcher, and a failing fetcher rejects the whole call. To show the Stories before their products, call `getRawAds` and then `hydrateAds`.

- b4350e7: New `intelligentSearchAvailability(product, offer)` reads whether an offer can be bought from an Intelligent Search product: `AvailableQuantity` above 0, from the offer's SKU and seller. It returns undefined when the product doesn't have that SKU or seller, or the quantity isn't a number. It implements the new `ProductAvailabilityReader<T>` type, so a custom hydration strategy can bring its own reader.
- 3261876: New `intelligentSearchPrice(product, offer)` reads an offer's price from an Intelligent Search product: `Price` and, when above it, `ListPrice`, from the offer's SKU and seller, as Intelligent Search sends them (a price of 0 included). It returns undefined when the product doesn't have that SKU or seller, or the price isn't a number. It implements the new `ProductPriceReader<T>` type and returns the new `ProductPrice` type, so a custom hydration strategy can bring its own reader.
- 3261876: `intelligentSearchFetcher` also finds the products of offers without a product ID, as a Story's product: it searches those by SKU (`q=sku:…`), and the offers with a product ID by product ID, as before. It sends one request per 24 ids, in parallel, because one search response holds at most 24 products: before, the products past the 24th were lost. A new `getProductsBySkuIds` in `@vtex/ads-core/search` makes one SKU search request. Both searches encode each id, so one with `;` or `&` can't change the query.
- 6495795: Add the Story ad type. Placements accept `types: ["story"]`, and `getRawAds`, `getHydratedAds` and `getHydratedAdsByIS` return the Story ads under `stories`, grouped by placement. New public types: `StoryAdDetail`, `StoryProduct` and `StoriesByPlacements`.

  `getHydratedAds` and `getHydratedAdsByIS` no longer call the product fetcher when the response has no product to find (for example, only link Stories).

- e36dc60: `StoryAdDetail` has the optional `call_to_action`: the text of the Story's call to action button, set in the campaign, for a link destination.

### Patch Changes

- 6495795: Fix `require("@vtex/ads-core")`, `require("@vtex/ads-core/search")` and `require("@vtex/ads-core/adServer")`: the CommonJS entry points named files the build doesn't emit (`.cjs.js` and `.js` instead of `.cjs`), so they failed with `MODULE_NOT_FOUND`. ES module imports were not affected.

## 0.5.3

### Patch Changes

- Version bump to retrigger publish pipeline with corrected pack configuration

## 0.5.2

### Patch Changes

- fa11fc2: Infer term from sellerName/seller facets when search.term is undefined, so seller pages send context "search" instead of "home"

## 0.5.1

### Patch Changes

- 8bedc97: Remove unused dependency (`@vtex/diagnostics-web`)

## 0.5.0

### Minor Changes

- a92f76f: Add OTLP log errors

## 0.4.0

### Minor Changes

- 6633592: Add OTLP log errors

## 0.3.1

### Patch Changes

- 2b29ada: bump version

## 0.3.0

### Minor Changes

- 7562799: Add support for CJS build, `enabled` prop and cross-build context

### Patch Changes

- 5561258: Fix ads-react CJS build by not including ads-core

## 0.2.3-beta.0

### Patch Changes

- 5561258: Fix ads-react CJS build by not including ads-core

## 0.2.2

### Patch Changes

- 38d0b96: Add support for CJS build

## 0.2.1

### Patch Changes

- 9b68f23: Fix incompatibility issues with ESM environments

## 0.2.0

### Minor Changes

- Add README to Ads Core

---
sidebar_position: 4
---

# Product Hydration

The ad API sends only part of a product's details: no price yet. Once the
carousel shows, the element fetches its products in one request, with a
hydration strategy from `@vtex/ads-core`, and shows the details it reads from
them over the ad API's: for now, the price and whether the product can be
bought.

## Choosing a strategy

- **`hydration` property**: a strategy `{ fetcher, matcher, price, available? }`,
  as an object. Set it before the element is on the page, or the Stories are
  requested again.
- **`hydration="none"`**: no product request.
- **Neither, with `account-name`**: Intelligent Search, from
  `{account-name}.vtexcommercestable.com.br`.
- **Neither, without `account-name`**: no product request.

`hydration-timeout` sets the time limit for the product request, in
milliseconds (default `5000`).

## Custom strategy

| Member      | Type                        | What it does                                                                    |
| ----------- | --------------------------- | ------------------------------------------------------------------------------- |
| `fetcher`   | `ProductFetcher`            | Fetches the products for the Stories' offers, in one request                    |
| `matcher`   | `ProductMatchesOffer`       | Tells which fetched product belongs to which offer                              |
| `price`     | `ProductPriceReader`        | Reads an offer's price, `{ price, listPrice? }`, from its product               |
| `available` | `ProductAvailabilityReader` | Optional. Whether the product can be bought (see [Availability](#availability)) |

`fetcher` and `matcher` work as in `@vtex/ads-core`: see
[Custom Hydration](../ads-core/custom-hydration.md) for examples against a
REST API and a GraphQL endpoint.

```js
const story = document.querySelector("vtex-ads-story-carousel");
story.hydration = {
  fetcher: async (offers, identity, { signal }) =>
    fetchMyProducts(offers, signal),
  matcher: (product, offer) => product.sku === offer.skuId,
  price: (product) => ({ price: product.price, listPrice: product.listPrice }),
};
```

In TypeScript, type it with `StoryHydration`, exported by
`@vtex/ads-stories`:

```ts
import type { StoryHydration } from "@vtex/ads-stories";

const hydration: StoryHydration<MyProduct> = {
  fetcher: async (offers, identity, options) =>
    fetchMyProducts(offers, options?.signal),
  matcher: (product, offer) => product.sku === offer.skuId,
  price: (product) => ({ price: product.price, listPrice: product.listPrice }),
};
```

## While it loads, and without it

While the request runs, the price and the panel's add to cart button show
placeholders. Then the fetched price shows, as the strategy returns it, and so
does add to cart. A `listPrice` shows struck through only when it is above the
price.

Without a fetched price (no strategy, a request that fails or takes longer
than `hydration-timeout`, a product not found or without a price, or a
`price` that returns something other than an amount), the card shows the price
from the product's `product_metadata` (`price`, and `promotional_price` when on
sale), or only the name without one.

## Availability

A strategy can also say whether the product can be bought, with an optional
`available(product, offer)`. When it says no, the card and the player keep
showing the price (or **Sold out** in its place when there is none), add to
cart becomes a disabled **Product unavailable**, and **View product** still
opens the product page. The Story keeps playing. Without `available`, or when
it doesn't say, the product shows as available.

Intelligent Search's strategy reads `AvailableQuantity`: a SKU with an
`AvailableQuantity` of 0 or less is sold out. A retailer that allows backorder
or doesn't track stock may therefore see products as **Sold out** that it still
sells. Pass an `available` of your own in the strategy to change that.

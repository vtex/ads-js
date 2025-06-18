# @vtex/ads-react

React SDK for requesting and rendering VTEX Ads in React storefronts. This
package provides a declarative API to load ads based on placement and render
them reactively, abstracting request batching and subscription lifecycle.

## Roadmap

- [ ] Implement `useRawAds` hook Low-level access to ads without hydration.

  Useful for implementing hydration in a specific storefront data format and
  endpoint.

- [ ] Implement `useHydratedAds` hook

  Return ads with additional product metadata, ready for UI display. May not
  use the best caching strategy for the specific storefront being used.

- [ ] Request batching

  Consolidate multiple ads calls into a single network request to reduce load
  and latency.

## Installation

```bash
npm install @vtex/ads-react
# or
yarn add @vtex/ads-react
```

## Setting up the Ads Provider

// quem hidrata é o provider, não o ads.

Before requesting any ads, wrap your app or page component tree with the
`AdsProvider`. This provider is responsible for managing ad requests and
distributing results to child components.

```jsx
import { AdsProvider } from "@vtex/ads-react";

const Page = () => {
  return (
    <AdsProvider
      accountName={accountName}
      publisherId={publisherId}
      userId={userId}
      sessionId={sessionId}
      channel={channel}
    >
      <App />
    </AdsProvider>
  );
};
```

You only need one `<AdsProvider>` around the subtree where ads will be
requested.

## Requesting ads

Call `useAds()` inside your component to request ads for a specific placement:

```ts
const { ads, isLoading, error } = useAds({
  placement: "search_top_product",
  type: "product",
  amount: 2,
  term: "tv",
});
```

The ads hooks will return an object with the following properties:

- `ads`, an array of sponsored items matching the criteria.
- `isLoading`, which is `true` while the request is in progress.
- `error`, that will be populated if the request fails.

You can call `useRawAds()` multiple times within the same component to request
different placements.

```ts
const { ads: searchAds, isLoading: isSearchAdsLoading } = useRawAds({
  placement: "search_top_product",
  type: "product",
  amount: 2,
  term: "tv",
});

const { ads: shelfAds, isLoading: isShelfAdsLoading } = useRawAds({
  placement: "search_top-shelf_product",
  type: "product",
  amount: 10,
  term: "tv",
});
```

Each call triggers its own request and receives its own result.

### Request batching

When multiple components call `useRawAds()` during the same render cycle or
within a short debounce window, their requests are automatically batched into a
single HTTP call. This optimizes performance by reducing the number of network
requests sent to the Ad Server. It also may be used to guarantee that ads won't
repeat across placements

For example, the following two calls will be combined into a single request
internally:

```ts
const bannerAds = useRawAds({
  placement: "search_banner",
  type: "banner",
  amount: 1,
});

const shelfAds = useRawAds({
  placement: "search_shelf",
  type: "product",
  amount: 6,
});
```

Under the hood, the SDK will send one consolidated request like:

```ts
{
  "placements": {
    "search_banner": { "type": "banner", "amount": 1 },
    "search_shelf": { "type": "product", "amount": 6 }
  }
}
```

To make ads unique across placements, set the `showUniqueAds` prop on the
`AdsProvider` component.

```jsx
<AdsProvider
  publisherId={publisherId}
  userId={userId}
  sessionId={sessionId}
  channel={channel}
  showUniqueAds={true}
>
  <App />
</AdsProvider>
```

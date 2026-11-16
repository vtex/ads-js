# @vtex/ads-stories

VTEX Ads Stories web component. Framework-agnostic: works on any HTML5 page,
including VTEX IO, FastStore and non-VTEX storefronts.

> Work in progress. Currently requests the placement's Stories from the ad
> API, shows them in a carousel, whose cards open in a player at the bottom
> right, sends their impression, view and click events, and tells the store
> when a product is added to or removed from the cart.

## npm

```bash
npm install @vtex/ads-stories
```

Register the element once, on the client:

```javascript
import { defineVtexAdsStoryCarousel } from "@vtex/ads-stories";

defineVtexAdsStoryCarousel();
```

```html
<vtex-ads-story-carousel
  publisher-id="your-publisher-id"
  session-id="the-store-session-id"
  placement="home_stories"
></vtex-ads-story-carousel>
```

## CDN

The same build is available as a standalone script from
[unpkg](https://unpkg.com) and [jsDelivr](https://www.jsdelivr.com). It
registers `<vtex-ads-story-carousel>` when it loads, so no JavaScript is
needed in the page. Always pin an exact version: replace `<version>` below
with a version published on
[npm](https://www.npmjs.com/package/@vtex/ads-stories?activeTab=versions).

```html
<script
  src="https://unpkg.com/@vtex/ads-stories@<version>"
  integrity="sha384-<hash>"
  crossorigin="anonymous"
></script>

<vtex-ads-story-carousel
  publisher-id="your-publisher-id"
  session-id="the-store-session-id"
  placement="home_stories"
></vtex-ads-story-carousel>
```

## Documentation

The full guide is on the
[VTEX Ads JS SDK documentation](https://vtex.github.io/ads-js/docs/ads-stories/quickstart):

- [Quickstart](https://vtex.github.io/ads-js/docs/ads-stories/quickstart):
  npm and CDN (integrity hash, Content-Security-Policy), server-side
  rendering, TypeScript and React.
- [Configuration](https://vtex.github.io/ads-js/docs/ads-stories/configuration):
  attributes, language and labels, CSS variables.
- [Layout and player](https://vtex.github.io/ads-js/docs/ads-stories/layout-and-player):
  the carousel, the product and its cart stepper, the call to action, the
  player and video errors.
- [Product hydration](https://vtex.github.io/ads-js/docs/ads-stories/product-hydration):
  where prices and availability come from, and custom strategies.
- [Events](https://vtex.github.io/ads-js/docs/ads-stories/events): the add
  and remove from cart events for the store, and the ad events the element
  sends.

## Contributing

To run the element locally or contribute a change, see
[CONTRIBUTING.md](https://github.com/vtex/ads-js/blob/main/CONTRIBUTING.md).

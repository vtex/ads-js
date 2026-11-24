---
sidebar_position: 1
---

# Quickstart

The `@vtex/ads-stories` package is the VTEX Ads Stories web component,
`<vtex-ads-story-carousel>`. It requests a placement's Stories from the ad
API, shows them in a carousel whose cards open in a video player, sends their
ad events, and tells the store when a product is added to or removed from the
cart.

It is framework-agnostic: it works on any HTML5 page, including VTEX IO,
FastStore and non-VTEX storefronts. Load it from npm or, with no build step,
from a CDN.

Building your own carousel, or a native app? Call the ad API directly: see
[Ad API](./ad-api.md) for the request, the response and the events to send.

:::tip Try it
Explore the element's variants, attributes and CSS variables live in the
[Stories Storybook](pathname:///ads-js/storybook/).
:::

## Enable Story ads

Story ads are off by default. Before the store can show them:

1. **Ask the VTEX Ads team to turn Story on.** It is a store configuration
   only they can change (for a network, once for the whole network).
2. **Turn on the ad type**: in **Settings > Ad types** on the
   [VTEX Ads platform](https://app.ads.vtex.com/), check **Story** and save.
3. **Give it to the advertisers**: in **Settings > Advertisers**, add
   **Story** to the ad types of each advertiser that may run Story campaigns.

Advertisers can then create Story campaigns, which run once the store approves
them.

## Installation

### npm

```bash
npm install @vtex/ads-stories
```

Register the element once, on the client:

```javascript
import { defineVtexAdsStoryCarousel } from "@vtex/ads-stories";

defineVtexAdsStoryCarousel();
```

Then place it on the page:

```html
<vtex-ads-story-carousel
  publisher-id="your-publisher-id"
  session-id="the-store-session-id"
  placement="home_stories"
></vtex-ads-story-carousel>
```

Importing the package registers nothing: the element is only registered when
`defineVtexAdsStoryCarousel()` is called. Both ESM (`import`) and CommonJS
(`require`) builds are published, with type declarations.

### CDN

The same build is available as a standalone script from
[unpkg](https://unpkg.com) and [jsDelivr](https://www.jsdelivr.com). It
registers `<vtex-ads-story-carousel>` when it loads, so no JavaScript is
needed in the page. Always pin an exact version: a pinned URL never changes.
Replace `<version>` below with a version published on
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

- The full file URL works too:
  `https://unpkg.com/@vtex/ads-stories@<version>/dist/cdn/vtex-ads-stories.js`.
- jsDelivr serves the same file:
  `https://cdn.jsdelivr.net/npm/@vtex/ads-stories@<version>`.
- `integrity` is optional. With it, the browser refuses the file if its content
  is not exactly the published one. Get the hash for a version with:

  ```bash
  curl -fsSLo vtex-ads-stories.js https://unpkg.com/@vtex/ads-stories@<version>/dist/cdn/vtex-ads-stories.js \
    && openssl dgst -sha384 -binary vtex-ads-stories.js | openssl base64 -A
  ```

  The hash is only printed if the download succeeded, so a wrong version
  shows an error instead of a hash of an error page.

- Stores with a Content-Security-Policy must allow the CDN host in
  `script-src` (`https://unpkg.com` or `https://cdn.jsdelivr.net`), besides
  the hosts in [Content Security Policy](../guides/content-security-policy.md).
- The script also exposes `window.VtexAdsStories`, with
  `VtexAdsStoryCarouselElement`, `defineVtexAdsStoryCarousel` and `TAG_NAME`.
  The commerce event names aren't in it: use the strings
  `"vtex-ads-story:add-to-cart"` and `"vtex-ads-story:remove-from-cart"` (see
  [Commerce events](./events.md#commerce-events)).

## Server-side rendering

The package can be imported during server-side rendering (for example in
FastStore, which is Next.js). The element is built with
[Lit](https://lit.dev), and in Node Lit installs a minimal DOM shim, so after
the import `globalThis.customElements` is defined on the server too. Don't use
`typeof customElements` to tell the server from the browser; use
`typeof window` instead. Calling `defineVtexAdsStoryCarousel()` on the server
is safe: it registers the element in Lit's server-side registry and renders
nothing.

## TypeScript and React

`document.createElement("vtex-ads-story-carousel")` and
`document.querySelector("vtex-ads-story-carousel")` are typed as
`VtexAdsStoryCarouselElement` out of the box.

To use `<vtex-ads-story-carousel>` in `.tsx` files, enable its JSX types once
in your project (requires `@types/react` 18.2.6 or newer, including 19):

```tsx
// e.g. in your app's entry file or a .d.ts file
import type {} from "@vtex/ads-stories/react";

export const Ad = () => (
  <vtex-ads-story-carousel
    publisher-id="your-publisher-id"
    session-id="the-store-session-id"
    placement="home_stories"
  />
);
```

The JSX types include the element's attributes: `publisher-id`, `session-id`
and `placement` are required, as in HTML, and `channel` only accepts `site` or
`app`.

Or add `"@vtex/ads-stories/react"` to `compilerOptions.types` in
`tsconfig.json`. Without it, TypeScript reports
`Property 'vtex-ads-story-carousel' does not exist on type 'JSX.IntrinsicElements'`.
The types are opt-in so projects without React don't need `@types/react`.

## Next steps

- [Configuration](./configuration.md): the element's attributes, language and
  CSS variables.
- [Layout and player](./layout-and-player.md): how the Stories show and play.
- [Product hydration](./product-hydration.md): where the products' prices and
  availability come from.
- [Events](./events.md): the cart events for the store, and the ad events the
  element sends.
- [Ad API](./ad-api.md): the Story request and response, for stores and apps
  that don't use the element.

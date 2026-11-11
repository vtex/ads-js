# @vtex/ads-stories

VTEX Ads Stories web component. Framework-agnostic: works on any HTML5 page,
including VTEX IO, FastStore and non-VTEX storefronts.

> Work in progress. Currently requests the placement's Stories from the ad
> API and shows them in a carousel, whose cards open in a player at the bottom
> right. The ad events come next.

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

Importing the package registers nothing: the element is only registered when
`defineVtexAdsStoryCarousel()` is called. Both ESM (`import`) and CommonJS
(`require`) builds are published, with type declarations.

The package can be imported during server-side rendering (for example in
FastStore, which is Next.js). The element is built with
[Lit](https://lit.dev), and in Node Lit installs a minimal DOM shim, so after
the import `globalThis.customElements` is defined on the server too. Don't use
`typeof customElements` to tell the server from the browser; use
`typeof window` instead. Calling `defineVtexAdsStoryCarousel()` on the server is
safe: it registers the element in Lit's server-side registry and renders
nothing.

### TypeScript and React

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

## CDN

The same build is available as a standalone script from
[unpkg](https://unpkg.com) and [jsDelivr](https://www.jsdelivr.com). It
registers `<vtex-ads-story-carousel>` when it loads, so no JavaScript is
needed in the page. Always pin an exact version: a pinned URL never changes.

```html
<script
  src="https://unpkg.com/@vtex/ads-stories@0.2.0"
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
  `script-src` (`https://unpkg.com` or `https://cdn.jsdelivr.net`).
- The script also exposes `window.VtexAdsStories` with the same API as the npm
  package.

## Attributes

The element requests the placement's Stories from the VTEX Ads ad API with
[`@vtex/ads-core`](../core) and shows them in a carousel (see
[Layout](#layout)).

| Attribute            | Required | Description                                                                                                                                                                             |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publisher-id`       | Yes      | The publisher the ads are requested for                                                                                                                                                 |
| `session-id`         | Yes      | The store's session id. Use the same one sent with the store's other ad events                                                                                                          |
| `placement`          | Yes      | The Story placement configured for the publisher                                                                                                                                        |
| `user-id`            | No       | The shopper's id, when known                                                                                                                                                            |
| `account-name`       | No       | The VTEX account name. Also turns on the product hydration from Intelligent Search (see [Product hydration](#product-hydration))                                                        |
| `channel`            | No       | `site` or `app`. Other values are not sent                                                                                                                                              |
| `timeout`            | No       | Time limit for the ad request, in milliseconds. Default `2000`                                                                                                                          |
| `quantity`           | No       | How many Stories to request: the carousel positions. Default `8`. Below `1` or not a number: the default                                                                                |
| `currency`           | No       | Currency of the product prices, as an ISO 4217 code (`BRL`, `ARS`). Default `BRL`. An invalid code uses the default                                                                     |
| `label-add-to-cart`  | No       | The add to cart button's text. Missing or blank: the default in the element's language (see [Language](#language))                                                                      |
| `label-view-product` | No       | The view product button's text. Missing or blank: the default in the element's language                                                                                                 |
| `inactive-autoplay`  | No       | With more than one Story, the visible cards without the highlight also play their video, muted. On when present without a value or `"true"`; off by default, they show only their cover |
| `hydration`          | No       | `none`: no product request. Any other value is ignored. To set a strategy, use the `hydration` property (see [Product hydration](#product-hydration))                                   |
| `hydration-timeout`  | No       | Time limit for the product request, in milliseconds. Default `5000`                                                                                                                     |

The element renders nothing while the request is pending, when a required
attribute is missing, when the request fails or takes longer than `timeout`,
or when the placement has no Story. Changing any of these attributes, except
`timeout`, `hydration-timeout`, `inactive-autoplay`, `currency`,
`label-add-to-cart` and `label-view-product`, requests the Stories again; a
new time limit applies to the next request.

## Language

The element's texts (buttons, "Esgotado", and the names screen readers read
out) and its prices follow the language of the closest element with a `lang`
attribute, the element itself included: usually `<html lang>`, or
`<vtex-ads-story-carousel lang="es-AR">` for the widget alone. The texts come in
Portuguese, Spanish and English, picked by the language alone (`es-AR` and
`es-MX` both get Spanish). Without a `lang`, or with another language, they
are in Portuguese and prices use `pt-BR`.

`label-add-to-cart` and `label-view-product` replace those two buttons'
texts in any language:

```html
<vtex-ads-story-carousel
  lang="es-AR"
  label-add-to-cart="Comprar"
  label-view-product="Ver detalles"
  ...
></vtex-ads-story-carousel>
```

The call to action's text comes from the campaign.

## Customization

```css
vtex-ads-story-carousel {
  --vtex-ads-story-font-family: "Inter", sans-serif;
  --vtex-ads-story-color-text: #1f1f1f;
  --vtex-ads-story-color-muted: #6b6b6b;
  --vtex-ads-story-color-surface: #fff;
  --vtex-ads-story-color-accent: #1b75a8;
  --vtex-ads-story-color-accent-contrast: #fff;
  --vtex-ads-story-radius: 20px;
}
```

| Variable                                 | Default                            | Used for                                                                                  |
| ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `--vtex-ads-story-font-family`           | inherited                          | All text                                                                                  |
| `--vtex-ads-story-color-text`            | inherited (`#242424` in the panel) | All text off the video, such as the open product panel's                                  |
| `--vtex-ads-story-color-muted`           | `#6b6b6b`                          | The panel's "from" price and its disabled add to cart                                     |
| `--vtex-ads-story-color-surface`         | `#fff` (`#fafafa` behind the card) | The open product panel, the view product button, and the background behind a single Story |
| `--vtex-ads-story-color-accent`          | `#1b75a8`                          | The product panel's buttons                                                               |
| `--vtex-ads-story-color-accent-contrast` | `#fff`                             | Text on the add to cart button                                                            |
| `--vtex-ads-story-radius`                | `20px`                             | Card and background corners                                                               |

Text over the video stays white: it sits on the video, not on a store color.

## Layout

The element requests up to `quantity` Stories and lays them out in a 500px tall
band as wide as its parent:

- **One Story**: the card is centered over a background. On screens 576px wide
  or less, the card shows alone, without the background.
- **Two Stories**: both cards side by side. One has the highlight (full size);
  the other is smaller and dimmed.
- **Three or more**: the highlighted card in the middle, the others on each
  side, smaller and dimmed, up to two per side. Every card moves one place per
  step. With four, the Story opposite the highlighted one shows at both ends.
  Two Stories also show this way on screens 576px wide or less, with the other
  one on both sides.

With more than one Story, the highlight moves to the next card every 5 seconds,
except while the pointer is over the carousel, the keyboard focus is in it, or
the player is open. It also moves with the arrows, a swipe, or a click on a
dimmed card. If the highlighted card's sound is on, the next highlighted card
plays with sound too, or muted if the browser blocks it.

### Product

When the Story's destination is a product, the card shows it at the bottom: its
image, its name (up to two lines) and its price. On sale, the "from" price
shows struck through beside it.

In the player, the same product sits at the bottom of the video. Clicking it
opens a panel with an add to cart button and a view product link (the product
page, in a new tab). Clicking the product on the highlighted card opens the
player with the panel already open; on another card, it moves the highlight, as
the card does. Clicking the video or moving to another Story closes the panel.
Adding to the cart does nothing yet.

Prices are formatted in the element's language (see [Language](#language))
and in `currency`.

#### Product hydration

The ad API sends only part of a product's details: no price yet. Once the
carousel shows, the element fetches its products in one request, with a
hydration strategy from [`@vtex/ads-core`](../core), and shows the details it
reads from them over the ad API's. For now, the price is the only one.

- **`hydration` property**: a strategy `{ fetcher, matcher, price, available? }`, as an
  object. `fetcher` and `matcher` are a `ProductFetcher` and a
  `ProductMatchesOffer`; `price` reads an offer's price from a fetched product
  (a `ProductPriceReader`). Set it before the element is on the page, or the
  Stories are requested again.
- **`hydration="none"`**: no product request.
- **Neither, with `account-name`**: Intelligent Search, from
  `{account-name}.vtexcommercestable.com.br`.
- **Neither, without `account-name`**: no product request.

```js
const story = document.querySelector("vtex-ads-story-carousel");
story.hydration = {
  fetcher: async (offers, identity, { signal }) =>
    fetchMyProducts(offers, signal),
  matcher: (product, offer) => product.sku === offer.skuId,
  price: (product) => ({ price: product.price, listPrice: product.listPrice }),
};
```

While the request runs, the price and the panel's add to cart button show
placeholders. Then the fetched price shows, as the strategy returns it,
and so does add to cart. Without one (no strategy, a request that fails or
takes longer than `hydration-timeout`, a product not found or without a
price), the card shows the price from the product's `product_metadata`
(`price`, and `promotional_price` when on sale), or only the name without
one.

A strategy can also say whether the product can be bought, with an optional
`available(product, offer)` (a `ProductAvailabilityReader`; Intelligent
Search's reads `AvailableQuantity`). When it says no, the card and the player
show **Esgotado** in place of the price, add to cart becomes a disabled
**Produto indisponível**, and **Ver produto** still opens the product page.
The Story keeps playing. Without `available`, or when it doesn't say, the
product shows as before.

Intelligent Search's check follows the stock it reports: a SKU with an
`AvailableQuantity` of 0 or less is sold out. A retailer that allows backorder
or doesn't track stock may therefore see products as **Esgotado** that it still
sells. Pass an `available` of your own in the strategy to change that.

### Call to action

When the Story's destination is a link (no product), the card and the player
show a call to action at the bottom instead: a button with the text set in the
campaign (the ad's `call_to_action`, such as "Saiba mais") and a caret, which
opens the link in a new tab. On a card without the highlight, it moves the
highlight, as the card does. Without a text, there is no button.

### Player

Clicking the highlighted card opens it in the mini player, at the bottom right
of the screen, which can be expanded. With more than one Story:

- **Mini player**: previous and next buttons above its top left change the video
  in the player, and the carousel highlight follows. The carousel's own advance
  stays stopped while the player is open.
- **Expanded player**: the other Stories' covers sit beside the video, up to two
  per side (click one to watch it), with previous and next beside it. When the
  video ends, the next Story plays. With two Stories, the video moves off center
  with the other cover beside it, without previous and next. On screens 576px
  wide or less, it fills the screen, without the covers, and previous and next
  sit inside the video's edges.
- **Keyboard**: with the focus in the player, the left and right arrow keys step
  too (not with a modifier key held). Elsewhere on the page they keep working as
  usual.

## Development

Run from the repository root:

```bash
pnpm stories:dev
```

This starts Storybook on port 6006, with a story for each scenario (one or
more Stories, theming, slow or empty ad server, product hydration), reloading
on save. The ad server and Intelligent Search are mocked with MSW, in
`stories/handlers.ts`.

To run the same stories against the built standalone script, the file the CDN
serves, run `pnpm preview:cdn` in this package.

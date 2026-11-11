---
"@vtex/ads-stories": minor
---

Show the Story's product on its card: a pill at the bottom with the product image, its name (up to two lines) and its price, with the "from" price struck through when on sale. Clicking it does the same as clicking the card. The ad API doesn't send prices yet, so the card reads them from the product's `product_metadata` (`price`, and `promotional_price` when on sale) and shows only the name without them. Stories without a product (a link destination) show no pill.

The mini and expanded player show the same pill at the bottom of the video, a bit larger (72px image, 56px in the mini player on screens 576px wide or less). Clicking it opens a panel below it, as in the prototype: the pill turns white and shows an add to cart button and a view product link, which opens the product page in a new tab. Adding to the cart does nothing yet. Clicking the product on the highlighted card opens the player with the panel already open. Clicking the video closes the panel without pausing, and moving to another Story or opening the player again starts with it closed. On devices with a mouse, the closed pill lifts and darkens on hover, on the card and in the player.

Prices are formatted in the language of the closest element with a `lang` attribute, the element itself included, so a store can set one for the widget alone (`<vtex-ads-story-carousel lang="es-AR">`). Without a `lang`, or with one the browser doesn't know, they use `pt-BR`.

New attribute, also in the React JSX types: `currency`, the currency of the prices as an ISO 4217 code (`BRL`). Default `BRL`, also for a code the browser doesn't know.

New CSS variables for the open product panel: `--vtex-ads-story-color-accent` colors its buttons (default `#1b75a8`) and `--vtex-ads-story-color-accent-contrast` the text on the add to cart button (default `#fff`); `--vtex-ads-story-color-surface` is its background and the view product button's (default `#fff`); `--vtex-ads-story-color-muted` is the "from" price and the disabled add to cart (default `#6b6b6b`); `--vtex-ads-story-color-text` now also colors its text (default `#242424` there).

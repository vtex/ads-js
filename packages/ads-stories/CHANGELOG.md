# @vtex/ads-stories

## 0.5.0

### Minor Changes

- 6495795: Add the `timeout` attribute: the time limit for the ad request, in milliseconds (default `2000`). Without a Story by then, the element renders nothing. The element also cancels its pending request when an attribute changes or it leaves the page, and requests again if moved while the request was pending.
- 2952cb3: Send each Story's impression, view and click to the event URLs from the ad response, at most once per Story and session. The impression goes out when the carousel renders the Stories; the view when a card, or the open player's video, stays at least 50% on screen for 2 continuous seconds; the click on the first touch on a card, or on the product or call to action in the player. Events are posted as JSON (`session_id`, `user_id`) with `navigator.sendBeacon`, falling back to a `keepalive` fetch.
- 6495795: Request the Story from the ad API with `@vtex/ads-core` instead of rendering a fixed test Story. The element takes the `publisher-id`, `session-id` and `placement` attributes (required) and `user-id`, `account-name` and `channel` (optional), and renders nothing while loading, without a required attribute, on error or when the placement has no Story.

  A failed request (other than one cancelled or past its time limit) is logged with `console.error`, so a failing request can be told apart from a placement with no Story.

  The React JSX types (`@vtex/ads-stories/react`) now include these attributes, with `publisher-id`, `session-id` and `placement` required.

- e36dc60: Stories whose destination is a link (no product) show a call to action at the bottom of the card and the video: a glass pill with the text set in the campaign (the ad's `call_to_action`) and a caret, which opens the link in a new tab. On a card without the highlight, it moves the highlight, as the card does. A Story without the text shows no button.
- 17603aa: The element is now `<vtex-ads-story-carousel>` instead of `<vtex-ads-story>`, also in the React JSX types and in `document.createElement` and `querySelector` types. `<vtex-ads-story>` is no longer registered: replace the tag in the page, and in any CSS selector that targets it. The CSS variables keep their `--vtex-ads-story-` names, and the console messages now start with `[vtex-ads-story-carousel]`.

  The exports follow the new name: `VtexAdsStoryElement` is now `VtexAdsStoryCarouselElement`, `defineVtexAdsStories()` is now `defineVtexAdsStoryCarousel()`, and the React types `VtexAdsStoryProps` and `VtexAdsStoryAttributes` are now `VtexAdsStoryCarouselProps` and `VtexAdsStoryCarouselAttributes`. The CDN script's global stays `window.VtexAdsStories`, with the renamed members.

- fc54bdd: Show the placement's Stories in a carousel, in a 500px tall band as wide as the element's parent. The layout depends on how many Stories come back:
  - **One**: the card is centered over a background, with 24px around it (the card shrinks to 452px tall) and a soft shadow. On screens 576px wide or less, the card shows alone at its full 500px height, without the background.
  - **Two**: both cards side by side. The highlighted card is full size and the other smaller and dimmed.
  - **Three or more**: the highlighted card in the middle and the others on each side, smaller and dimmed, up to two per side. Every card moves one place per step. With four, the Story opposite the highlighted one shows at both ends. On screens 576px wide or less, two Stories also show this way, with the other one on both sides.

  With more than one Story, the highlight moves to the next card every 5 seconds, except while the pointer is over the carousel, the keyboard focus is in it, or the player is open. It also moves with the previous and next arrows, a swipe, or a click on a dimmed card. Clicking the highlighted card opens it in the player. If the highlighted card's sound is on, the next highlighted card plays with sound too (muted instead, if the browser blocks it). With more than one Story, the mini player has previous and next buttons above its top left: they change the video in the player, and the carousel highlight follows. With the focus in the player, the left and right arrow keys do the same (not with a modifier key held); elsewhere on the page they keep working as usual. The expanded player shows the other Stories' covers beside the video, up to two per side (clicking one plays it), with previous and next beside it, and moves on to the next Story when the video ends instead of looping. With two Stories, the video moves off center with the other cover beside it. Each step animates: the video grows from the cover of the Story it now shows and the covers slide to their new places (not with reduced motion). On screens 576px wide or less, it fills the screen without the covers, with previous and next inside the video's edges.

  New attributes, also in the React JSX types:
  - `quantity`: how many Stories to request, the carousel positions (default `8`). A value below `1` or not a number uses the default. Changing it requests the Stories again.
  - `inactive-autoplay` (off by default): off, only the highlighted card plays its video and the others show their cover. On, the visible cards without the highlight also play, muted.

  New CSS variable: `--vtex-ads-story-color-surface` sets the background behind a single Story (default `#fafafa`). `--vtex-ads-story-radius` now rounds that background's corners as well as the card's.

- 17603aa: The element's texts follow its language: the buttons, "Esgotado" and the names screen readers read out come in Portuguese, Spanish and English, picked from the closest `lang` attribute like the prices (`es-AR` gets Spanish). Without a `lang`, or with another language, they stay in Portuguese.

  New attributes, also in the React JSX types: `label-add-to-cart` and `label-view-product` replace the product panel's button texts in any language. Missing or blank, the language's default shows. Changing them doesn't request the Stories again.

- b4350e7: The hydration strategy takes an optional `available(product, offer)`, and the Intelligent Search one reads `AvailableQuantity`. A product that can't be bought shows **Esgotado** in place of the price, on the card and in the player, and add to cart becomes a disabled **Produto indisponível**; **Ver produto** still works and the Story keeps playing. `StoryProductDetails` gets `available`.
- bff14ea: Show the Story's product on its card: a pill at the bottom with the product image, its name (up to two lines) and its price, with the "from" price struck through when on sale. Clicking it does the same as clicking the card. The ad API doesn't send prices yet, so the card reads them from the product's `product_metadata` (`price`, and `promotional_price` when on sale) and shows only the name without them. Stories without a product (a link destination) show no pill.

  The mini and expanded player show the same pill at the bottom of the video, a bit larger (72px image, 56px in the mini player on screens 576px wide or less). Clicking it opens a panel below it, as in the prototype: the pill turns white and shows an add to cart button and a view product link, which opens the product page in a new tab. Adding to the cart does nothing yet. Clicking the product on the highlighted card opens the player with the panel already open. Clicking the video closes the panel without pausing, and moving to another Story or opening the player again starts with it closed. On devices with a mouse, the closed pill lifts and darkens on hover, on the card and in the player.

  Prices are formatted in the language of the closest element with a `lang` attribute, the element itself included, so a store can set one for the widget alone (`<vtex-ads-story-carousel lang="es-AR">`). Without a `lang`, or with one the browser doesn't know, they use `pt-BR`.

  New attribute, also in the React JSX types: `currency`, the currency of the prices as an ISO 4217 code (`BRL`). Default `BRL`, also for a code the browser doesn't know.

  New CSS variables for the open product panel: `--vtex-ads-story-color-accent` colors its buttons (default `#1b75a8`) and `--vtex-ads-story-color-accent-contrast` the text on the add to cart button (default `#fff`); `--vtex-ads-story-color-surface` is its background and the view product button's (default `#fff`); `--vtex-ads-story-color-muted` is the "from" price and the disabled add to cart (default `#6b6b6b`); `--vtex-ads-story-color-text` now also colors its text (default `#242424` there).

- 3261876: The element hydrates its products once the carousel shows, in one request, and shows their fetched prices, with a hydration strategy: the new `hydration` property (`{ fetcher, matcher, price }`), or Intelligent Search by default when `account-name` is set. `hydration="none"` turns it off, and `hydration-timeout` sets its time limit (default 5000 ms). While it runs, the price and add to cart show placeholders; the fetched price then replaces the ad server's. Without one (no strategy, failure, time limit, product not found or without a price), the ad server's price shows, as before. New types `StoryHydration` and `StoryProductDetails`.

### Patch Changes

- Updated dependencies [6495795]
- Updated dependencies [6495795]
- Updated dependencies [3261876]
- Updated dependencies [3261876]
- Updated dependencies [b4350e7]
- Updated dependencies [3261876]
- Updated dependencies [3261876]
- Updated dependencies [6495795]
- Updated dependencies [e36dc60]
  - @vtex/ads-core@0.6.0

## 0.4.1

### Patch Changes

- 47bdafb: `<vtex-ads-story>` is now built with Lit. It looks and behaves the same in the browser; `lit` is a new dependency of the npm package (bundled in the CJS build and in the CDN script). In Node (SSR), importing the package now installs Lit's DOM shim, so `globalThis.customElements` is defined there.
- 46b3798: The card's sound on/off button now only shows while the card's video plays. It no longer shows when the video doesn't play: for people who prefer reduced motion, when the browser blocks autoplay (as iOS Low Power Mode does), and while the player is open.

## 0.4.0

### Minor Changes

- 2c00914: `<vtex-ads-story>` now plays the Story's video. For now it renders one fixed test Story from public URLs, until the carousel passes in Stories from the ad API. The card loops the video muted over the cover (not for people who prefer reduced motion), with a sound on/off button at its top right, and pauses while the player is open. The player plays it muted, with play/pause in the middle (also by clicking the video) and a sound on/off button at the top right. If the video can't load, the cover stays and the video controls are hidden.

## 0.3.0

### Minor Changes

- d9298f3: The Story card is now a button with a play icon in the middle (on hover or keyboard focus with a mouse, always on touch screens). Clicking it, or pressing Enter or Space, opens the same Story in a player at the bottom right of the page. Its expand button switches to an expanded view, centered over a dark backdrop (full screen on phones), and back. The player closes from its close button, with Escape, or by clicking the backdrop of the expanded view.
- e9bb636: `<vtex-ads-story>` now renders a placeholder 9:16 card (500px tall) instead of the "Hello world" greeting. The card corners use the `--vtex-ads-story-radius` CSS variable (default `20px`). The `name` attribute was removed.

## 0.2.0

### Minor Changes

- Add TypeScript types for using `<vtex-ads-story>` in React: opt in with `import type {} from "@vtex/ads-stories/react"`. `document.createElement("vtex-ads-story")` and `querySelector("vtex-ads-story")` are now typed as `VtexAdsStoryElement`.
- The bare CDN URLs (`https://unpkg.com/@vtex/ads-stories@<version>` and `https://cdn.jsdelivr.net/npm/@vtex/ads-stories@<version>`) now serve the standalone browser script (`dist/cdn/vtex-ads-stories.js`) instead of the CommonJS build.

## 0.1.0

### Minor Changes

- First release of `@vtex/ads-stories`: the `<vtex-ads-story>` web component (placeholder), with ESM and CommonJS builds and type declarations.

---
sidebar_position: 5
---

# Events

## Commerce events

The element has no cart of its own: it tells the store with Custom Events. They
bubble and are `composed`, so the store can listen on the element, the document
or any ancestor.

| Event                             | `detail`                    | When                                                         |
| --------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `vtex-ads-story:add-to-cart`      | `{ sku, seller, quantity }` | Add to cart, or the stepper's plus, is clicked in the player |
| `vtex-ads-story:remove-from-cart` | `{ sku, seller, quantity }` | The stepper's minus, or its trash, is clicked in the player  |

- **`vtex-ads-story:add-to-cart`**: `sku` is the Story product's
  `product_sku` and `seller` its `seller_id`, as the ad API returned them
  (`seller` is left out when the ad API sends none); `quantity` is always `1`.
  It has no default action: the store adds the item. The player stays open.
- **`vtex-ads-story:remove-from-cart`**: the same `detail`, where `quantity`
  is how many to remove, always `1`. No default action: the store removes the
  item, or lowers its quantity by one.

```js
document.addEventListener("vtex-ads-story:add-to-cart", (event) => {
  const { sku, seller, quantity } = event.detail;
  addToMyCart(sku, quantity, seller);
});

document.addEventListener("vtex-ads-story:remove-from-cart", (event) => {
  const { sku, seller, quantity } = event.detail;
  removeFromMyCart(sku, quantity, seller);
});
```

See [Cart stepper](./layout-and-player.md#cart-stepper) for how the player
counts what was added.

### TypeScript

The listeners' events are typed as `StoryAddToCartEvent` and
`StoryRemoveFromCartEvent` once the package is imported, on any element,
`document` and `window`. `ADD_TO_CART_EVENT` and `REMOVE_FROM_CART_EVENT` hold
the events' names, and `StoryAddToCartDetail` types their `detail`:

```ts
import {
  ADD_TO_CART_EVENT,
  REMOVE_FROM_CART_EVENT,
  type StoryAddToCartDetail,
} from "@vtex/ads-stories";

function addToMyCart({ sku, seller, quantity }: StoryAddToCartDetail) {
  // ...
}

function removeFromMyCart({ sku, seller, quantity }: StoryAddToCartDetail) {
  // ...
}

// `event` is a StoryAddToCartEvent: no cast needed.
document.addEventListener(ADD_TO_CART_EVENT, (event) => {
  addToMyCart(event.detail);
});

document.addEventListener(REMOVE_FROM_CART_EVENT, (event) => {
  removeFromMyCart(event.detail);
});
```

## Ad events

The element sends each Story's impression, view and click to the URLs the ad
API returned for it (`impression_url`, `view_url`, `click_url`), each at most
once per Story and `session-id`. The store doesn't need to send them:

- **Impression**: when the carousel shows the Stories, once the skeleton
  leaves. Nothing is sent while it is up.
- **View**: when a card's video, or the open player's, plays for 2 continuous
  seconds while at least 50% of it is on screen, with the page visible. A card
  showing only its cover, or a paused video, doesn't count, and cards behind
  the expanded player don't either. Browsers without `IntersectionObserver`
  send no view.
- **Click**: on the first touch on a card (its product, call to action and
  sound button included), or on the player's video (its play and sound
  buttons, product and call to action included). Previous, next and the
  player's window buttons don't count.

Each event is a `POST` with a JSON body holding `session_id` and, when set,
`user_id`, sent with `navigator.sendBeacon` (a `fetch` with `keepalive` when
the browser can't queue the beacon), so it isn't lost when the shopper leaves
the page. A failed `fetch` is logged to the console and not sent again. The ad
API also deduplicates the events by session. A store that changes the element
takes over keeping these rules.

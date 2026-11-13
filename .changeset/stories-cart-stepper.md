---
"@vtex/ads-stories": minor
---

Once a product is added from the player, a stepper takes add to cart's place: minus (a trash with one left), the quantity and plus. Plus dispatches `vtex-ads-story:add-to-cart`, and minus the new `vtex-ads-story:remove-from-cart`, with the same `{ sku, seller, quantity }` detail (`quantity` is how many to remove, always 1). The quantity counts what was added and removed, for each SKU, since the player opened; it doesn't read the store's cart, and opening the player again starts it over. `REMOVE_FROM_CART_EVENT`, `StoryRemoveFromCartDetail` and `StoryRemoveFromCartEvent` are exported.

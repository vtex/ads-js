---
"@vtex/ads-stories": minor
---

Add to cart in the player dispatches `vtex-ads-story:add-to-cart` from the element, with `{ sku, quantity }` (the product's `product_sku` and `1`). The event bubbles and is composed, has no default action, and leaves the player open. A product without a SKU has no add to cart. `ADD_TO_CART_EVENT`, `StoryAddToCartDetail` and `StoryAddToCartEvent` are exported.

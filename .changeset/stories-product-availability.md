---
"@vtex/ads-stories": minor
---

The hydration strategy takes an optional `available(product, offer)`, and the Intelligent Search one reads `AvailableQuantity`. A product that can't be bought shows **Esgotado** in place of the price, on the card and in the player, and add to cart becomes a disabled **Produto indisponível**; **Ver produto** still works and the Story keeps playing. `StoryProductDetails` gets `available`.

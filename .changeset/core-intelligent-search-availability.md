---
"@vtex/ads-core": minor
---

New `intelligentSearchAvailability(product, offer)` reads whether an offer can be bought from an Intelligent Search product: `AvailableQuantity` above 0, from the offer's SKU and seller. It returns undefined when the product doesn't have that SKU or seller, or the quantity isn't a number. It implements the new `ProductAvailabilityReader<T>` type, so a custom hydration strategy can bring its own reader.

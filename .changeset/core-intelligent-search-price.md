---
"@vtex/ads-core": minor
---

New `intelligentSearchPrice(product, offer)` reads an offer's price from an Intelligent Search product: `Price` and, when above it, `ListPrice`, from the offer's SKU and seller, as Intelligent Search sends them (a price of 0 included). It returns undefined when the product doesn't have that SKU or seller, or the price isn't a number. It implements the new `ProductPriceReader<T>` type and returns the new `ProductPrice` type, so a custom hydration strategy can bring its own reader.

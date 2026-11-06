---
"@vtex/ads-stories": minor
---

Show the Story's product on its card: a pill at the bottom with the product image, its name (up to two lines) and its price, with the "from" price struck through when on sale. Clicking it does the same as clicking the card. The ad API doesn't send prices yet, so the card reads them from the product's `product_metadata` (`price`, and `promotional_price` when on sale) and shows only the name without them. Stories without a product (a link destination) show no pill.

The mini and expanded player show the same pill at the bottom of the video, a bit larger (72px image, 56px in the mini player on screens 576px wide or less), for display only for now: clicking it doesn't pause the video. On devices with a mouse, the pill lifts and darkens on hover, on the card and in the player.

New attributes, also in the React JSX types:

- `locale`: locale of the prices, as a BCP 47 tag (`pt-BR`). Default: the `lang` of the closest element that has one, then `pt-BR`.
- `currency`: currency of the prices, as an ISO 4217 code (`BRL`). Default `BRL`.

---
"@vtex/ads-core": minor
---

`intelligentSearchFetcher` also finds the products of offers without a product ID, as a Story's product: it searches those by SKU (`q=sku:…`), and the offers with a product ID by product ID, as before. It sends one request per 24 ids, in parallel, because one search response holds at most 24 products: before, the products past the 24th were lost. A new `getProductsBySkuIds` in `@vtex/ads-core/search` makes one SKU search request. Both searches encode each id, so one with `;` or `&` can't change the query.

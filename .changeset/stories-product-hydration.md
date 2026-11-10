---
"@vtex/ads-stories": minor
---

The element hydrates its products once the carousel shows, in one request, and shows their fetched prices, with a hydration strategy: the new `hydration` property (`{ fetcher, matcher, price }`), or Intelligent Search by default when `account-name` is set. `hydration="none"` turns it off, and `hydration-timeout` sets its time limit (default 5000 ms). While it runs, the price shows a placeholder; the fetched price then replaces the ad server's. Without one (no strategy, failure, time limit, product not found or without a price), the ad server's price shows, as before. Add to cart is hidden only while the product loads. New types `StoryHydration` and `StoryProductDetails`.

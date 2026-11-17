---
"@vtex/ads-stories": patch
---

A hydration strategy whose `price()` returns no amount, `NaN`, a string or a negative amount no longer shows "R$ NaN": the ad server's price shows instead. A `listPrice` that isn't an amount above the price is dropped.

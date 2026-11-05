---
"@vtex/ads-stories": minor
---

Add the `timeout` attribute: the time limit for the ad request, in milliseconds (default `2000`). Without a Story by then, the element renders nothing. The element also cancels its pending request when an attribute changes or it leaves the page, and requests again if moved while the request was pending.

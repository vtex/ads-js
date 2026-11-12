---
"@vtex/ads-stories": minor
---

Show a skeleton of the carousel while the ad request is pending and then while the first Story's cover loads, and fade it out once the cards are ready, so the first card doesn't appear piece by piece. The cards show anyway 3 seconds after the Stories arrive, and a broken cover doesn't hold them. Without a required attribute, or when the request fails or the placement has no Story, the element still renders nothing. The Stories' views start counting only once the cards are visible.

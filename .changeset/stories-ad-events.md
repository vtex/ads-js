---
"@vtex/ads-stories": minor
---

Send each Story's impression, view and click to the event URLs from the ad response, at most once per Story and session. The impression goes out when the carousel renders the Stories; the view when a card, or the open player's video, stays at least 50% on screen for 2 continuous seconds; the click on the first touch on a card, or on the product or call to action in the player. Events are posted as JSON (`session_id`, `user_id`) with `navigator.sendBeacon`, falling back to a `keepalive` fetch.

---
"@vtex/ads-stories": minor
---

`<vtex-ads-story>` now plays the Story's video. For now it renders one fixed test Story from public URLs, until the carousel passes in Stories from the ad API. The card loops the video muted over the cover (not for people who prefer reduced motion), with a sound on/off button at its top right, and pauses while the player is open. The player plays it muted, with play/pause in the middle (also by clicking the video) and a sound on/off button at the top right. If the video can't load, the cover stays and the video controls are hidden.

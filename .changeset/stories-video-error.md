---
"@vtex/ads-stories": minor
---

A video that can't load no longer leaves only its cover: the card shows a **Video unavailable** notice over it, and the player shows **Couldn't load the video** with a **Try again** button. Retrying shows a spinner with **Loading video** until the video loads, then plays it with the sound on, or shows the notice again if it fails. `StoryLabels` gets `videoUnavailable`, `videoFailed`, `videoLoading` and `retry`, in Portuguese, Spanish and English.

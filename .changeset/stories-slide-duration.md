---
"@vtex/ads-stories": minor
---

New `slide-duration` attribute, also in the React JSX types: with more than one Story, how long each one stays highlighted before the carousel moves to the next, in milliseconds (default `5000`). `0` turns the automatic advance off, so the highlight moves only with the arrows, swipes and clicks. A negative value or one that isn't a number uses the default. Changing it doesn't request the Stories again: the highlighted Story's time starts over with the new duration.

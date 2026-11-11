---
"@vtex/ads-stories": minor
---

Show the placement's Stories in a carousel, in a 500px tall band as wide as the element's parent. The layout depends on how many Stories come back:

- **One**: the card is centered over a background, with 24px around it (the card shrinks to 452px tall) and a soft shadow. On screens 576px wide or less, the card shows alone at its full 500px height, without the background.
- **Two**: both cards side by side. The highlighted card is full size and the other smaller and dimmed.
- **Three or more**: the highlighted card in the middle and the others on each side, smaller and dimmed, up to two per side. Every card moves one place per step. With four, the Story opposite the highlighted one shows at both ends. On screens 576px wide or less, two Stories also show this way, with the other one on both sides.

With more than one Story, the highlight moves to the next card every 5 seconds, except while the pointer is over the carousel, the keyboard focus is in it, or the player is open. It also moves with the previous and next arrows, a swipe, or a click on a dimmed card. Clicking the highlighted card opens it in the player. If the highlighted card's sound is on, the next highlighted card plays with sound too (muted instead, if the browser blocks it). With more than one Story, the mini player has previous and next buttons above its top left: they change the video in the player, and the carousel highlight follows. With the focus in the player, the left and right arrow keys do the same (not with a modifier key held); elsewhere on the page they keep working as usual. The expanded player shows the other Stories' covers beside the video, up to two per side (clicking one plays it), with previous and next beside it, and moves on to the next Story when the video ends instead of looping. With two Stories, the video moves off center with the other cover beside it. Each step animates: the video grows from the cover of the Story it now shows and the covers slide to their new places (not with reduced motion). On screens 576px wide or less, it fills the screen without the covers, with previous and next inside the video's edges.

New attributes, also in the React JSX types:

- `quantity`: how many Stories to request, the carousel positions (default `8`). A value below `1` or not a number uses the default. Changing it requests the Stories again.
- `inactive-autoplay` (off by default): off, only the highlighted card plays its video and the others show their cover. On, the visible cards without the highlight also play, muted.

New CSS variable: `--vtex-ads-story-color-surface` sets the background behind a single Story (default `#fafafa`). `--vtex-ads-story-radius` now rounds that background's corners as well as the card's.

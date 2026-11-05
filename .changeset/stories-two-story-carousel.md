---
"@vtex/ads-stories": minor
---

Show up to two Stories. The element now requests two Stories from the placement. With two, both cards show side by side: the highlighted card is full size and the other smaller and dimmed. The highlight moves to the other card every 5 seconds (not while the pointer is over the carousel, the keyboard focus is in it, or the player is open), and with the previous and next arrows, a swipe, or a click on the dimmed card. Clicking the highlighted card opens it in the player. On screens 576px wide or less, the highlighted card is centered with the other peeking at its side.

Add the `inactive-autoplay` attribute (off by default). Off, only the highlighted card plays its video, and the other shows its cover. On, the other card also plays, muted. The React JSX types include it.

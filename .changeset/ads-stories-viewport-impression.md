---
"@vtex/ads-stories": minor
---

A Story's impression is sent only once at least 30% of its card is on screen, instead of for every Story as soon as the carousel renders. Cards off screen, in the carousel or below the fold, send theirs when they come into view. Browsers without `IntersectionObserver` send no impression, as they already sent no view.

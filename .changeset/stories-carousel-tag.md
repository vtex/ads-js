---
"@vtex/ads-stories": minor
---

The element is now `<vtex-ads-story-carousel>` instead of `<vtex-ads-story>`, also in the React JSX types and in `document.createElement` and `querySelector` types. `<vtex-ads-story>` is no longer registered: replace the tag in the page, and in any CSS selector that targets it. The CSS variables keep their `--vtex-ads-story-` names, and the console messages now start with `[vtex-ads-story-carousel]`.

The exports follow the new name: `VtexAdsStoryElement` is now `VtexAdsStoryCarouselElement`, `defineVtexAdsStories()` is now `defineVtexAdsStoryCarousel()`, and the React types `VtexAdsStoryProps` and `VtexAdsStoryAttributes` are now `VtexAdsStoryCarouselProps` and `VtexAdsStoryCarouselAttributes`. The CDN script's global stays `window.VtexAdsStories`, with the renamed members.

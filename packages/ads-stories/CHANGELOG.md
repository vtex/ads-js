# @vtex/ads-stories

## 0.3.0

### Minor Changes

- d9298f3: The Story card is now a button with a play icon in the middle (on hover or keyboard focus with a mouse, always on touch screens). Clicking it, or pressing Enter or Space, opens the same Story in a player at the bottom right of the page. Its expand button switches to an expanded view, centered over a dark backdrop (full screen on phones), and back. The player closes from its close button, with Escape, or by clicking the backdrop of the expanded view.
- e9bb636: `<vtex-ads-story>` now renders a placeholder 9:16 card (500px tall) instead of the "Hello world" greeting. The card corners use the `--vtex-ads-story-radius` CSS variable (default `20px`). The `name` attribute was removed.

## 0.2.0

### Minor Changes

- Add TypeScript types for using `<vtex-ads-story>` in React: opt in with `import type {} from "@vtex/ads-stories/react"`. `document.createElement("vtex-ads-story")` and `querySelector("vtex-ads-story")` are now typed as `VtexAdsStoryElement`.
- The bare CDN URLs (`https://unpkg.com/@vtex/ads-stories@<version>` and `https://cdn.jsdelivr.net/npm/@vtex/ads-stories@<version>`) now serve the standalone browser script (`dist/cdn/vtex-ads-stories.js`) instead of the CommonJS build.

## 0.1.0

### Minor Changes

- First release of `@vtex/ads-stories`: the `<vtex-ads-story>` web component (placeholder), with ESM and CommonJS builds and type declarations.

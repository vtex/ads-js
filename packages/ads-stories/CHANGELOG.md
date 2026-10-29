# @vtex/ads-stories

## 0.2.0

### Minor Changes

- Add TypeScript types for using `<vtex-ads-story>` in React: opt in with `import type {} from "@vtex/ads-stories/react"`. `document.createElement("vtex-ads-story")` and `querySelector("vtex-ads-story")` are now typed as `VtexAdsStoryElement`.
- The bare CDN URLs (`https://unpkg.com/@vtex/ads-stories@<version>` and `https://cdn.jsdelivr.net/npm/@vtex/ads-stories@<version>`) now serve the standalone browser script (`dist/cdn/vtex-ads-stories.js`) instead of the CommonJS build.

## 0.1.0

### Minor Changes

- First release of `@vtex/ads-stories`: the `<vtex-ads-story>` web component (placeholder), with ESM and CommonJS builds and type declarations.

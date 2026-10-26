# @vtex/ads-stories

VTEX Ads Stories web component. Framework-agnostic: works on any HTML5 page,
including VTEX IO, FastStore and non-VTEX storefronts.

> Work in progress. Currently renders a placeholder.

## npm

```bash
npm install @vtex/ads-stories
```

```javascript
import { defineVtexAdsStories } from "@vtex/ads-stories";

defineVtexAdsStories();
```

Importing the package has no side effects; call `defineVtexAdsStories()` to
register `<vtex-ads-story>`. Both ESM (`import`) and CJS (`require`) builds
are published.

## CDN

The standalone script registers the element on load:

```html
<script src="https://<cdn>/@vtex/ads-stories@<version>/dist/cdn/vtex-ads-stories.js"></script>

<vtex-ads-story></vtex-ads-story>
```

## Customization

```css
vtex-ads-story {
  --vtex-ads-story-font-family: "Inter", sans-serif;
  --vtex-ads-story-color-text: #1f1f1f;
}
```

## Development

Run from the repository root:

```bash
pnpm stories:dev
```

This starts a dev server with `index.html`, reloading on save.

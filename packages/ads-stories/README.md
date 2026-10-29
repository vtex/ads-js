# @vtex/ads-stories

VTEX Ads Stories web component. Framework-agnostic: works on any HTML5 page,
including VTEX IO, FastStore and non-VTEX storefronts.

> Work in progress. Currently renders a placeholder.

## npm

```bash
npm install @vtex/ads-stories
```

Register the element once, on the client:

```javascript
import { defineVtexAdsStories } from "@vtex/ads-stories";

defineVtexAdsStories();
```

```html
<vtex-ads-story name="VTEX Ads"></vtex-ads-story>
```

Importing the package has no side effects: nothing is registered until
`defineVtexAdsStories()` is called. It can be imported during server-side
rendering, where `defineVtexAdsStories()` does nothing. Both ESM (`import`) and
CommonJS (`require`) builds are published, with type declarations.

## CDN

WIP: To be defined

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

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

### TypeScript and React

`document.createElement("vtex-ads-story")` and
`document.querySelector("vtex-ads-story")` are typed as `VtexAdsStoryElement`
out of the box.

To use `<vtex-ads-story>` in `.tsx` files, enable its JSX types once in your
project (requires `@types/react` 18 or 19):

```tsx
// e.g. in your app's entry file or a .d.ts file
import type {} from "@vtex/ads-stories/react";

export const Ad = () => <vtex-ads-story name="VTEX Ads" />;
```

Or add `"@vtex/ads-stories/react"` to `compilerOptions.types` in `tsconfig.json`.
Without it, TypeScript reports
`Property 'vtex-ads-story' does not exist on type 'JSX.IntrinsicElements'`.
The types are opt-in so projects without React don't need `@types/react`.

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

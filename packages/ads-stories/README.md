# @vtex/ads-stories

VTEX Ads Stories web component. Framework-agnostic: works on any HTML5 page,
including VTEX IO, FastStore and non-VTEX storefronts.

> Work in progress. Currently requests the placement's Stories from the ad
> API and shows them in a carousel, whose cards open in a player at the bottom
> right. The ad events come next.

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
<vtex-ads-story
  publisher-id="your-publisher-id"
  session-id="the-store-session-id"
  placement="home_stories"
></vtex-ads-story>
```

Importing the package registers nothing: the element is only registered when
`defineVtexAdsStories()` is called. Both ESM (`import`) and CommonJS
(`require`) builds are published, with type declarations.

The package can be imported during server-side rendering (for example in
FastStore, which is Next.js). The element is built with
[Lit](https://lit.dev), and in Node Lit installs a minimal DOM shim, so after
the import `globalThis.customElements` is defined on the server too. Don't use
`typeof customElements` to tell the server from the browser; use
`typeof window` instead. Calling `defineVtexAdsStories()` on the server is
safe: it registers the element in Lit's server-side registry and renders
nothing.

### TypeScript and React

`document.createElement("vtex-ads-story")` and
`document.querySelector("vtex-ads-story")` are typed as `VtexAdsStoryElement`
out of the box.

To use `<vtex-ads-story>` in `.tsx` files, enable its JSX types once in your
project (requires `@types/react` 18.2.6 or newer, including 19):

```tsx
// e.g. in your app's entry file or a .d.ts file
import type {} from "@vtex/ads-stories/react";

export const Ad = () => (
  <vtex-ads-story
    publisher-id="your-publisher-id"
    session-id="the-store-session-id"
    placement="home_stories"
  />
);
```

The JSX types include the element's attributes: `publisher-id`, `session-id`
and `placement` are required, as in HTML, and `channel` only accepts `site` or
`app`.

Or add `"@vtex/ads-stories/react"` to `compilerOptions.types` in
`tsconfig.json`. Without it, TypeScript reports
`Property 'vtex-ads-story' does not exist on type 'JSX.IntrinsicElements'`.
The types are opt-in so projects without React don't need `@types/react`.

## CDN

The same build is available as a standalone script from
[unpkg](https://unpkg.com) and [jsDelivr](https://www.jsdelivr.com). It
registers `<vtex-ads-story>` when it loads, so no JavaScript is needed in the
page. Always pin an exact version: a pinned URL never changes.

```html
<script
  src="https://unpkg.com/@vtex/ads-stories@0.2.0"
  integrity="sha384-<hash>"
  crossorigin="anonymous"
></script>

<vtex-ads-story
  publisher-id="your-publisher-id"
  session-id="the-store-session-id"
  placement="home_stories"
></vtex-ads-story>
```

- The full file URL works too:
  `https://unpkg.com/@vtex/ads-stories@<version>/dist/cdn/vtex-ads-stories.js`.
- jsDelivr serves the same file:
  `https://cdn.jsdelivr.net/npm/@vtex/ads-stories@<version>`.
- `integrity` is optional. With it, the browser refuses the file if its content
  is not exactly the published one. Get the hash for a version with:

  ```bash
  curl -fsSLo vtex-ads-stories.js https://unpkg.com/@vtex/ads-stories@<version>/dist/cdn/vtex-ads-stories.js \
    && openssl dgst -sha384 -binary vtex-ads-stories.js | openssl base64 -A
  ```

  The hash is only printed if the download succeeded, so a wrong version
  shows an error instead of a hash of an error page.

- Stores with a Content-Security-Policy must allow the CDN host in
  `script-src` (`https://unpkg.com` or `https://cdn.jsdelivr.net`).
- The script also exposes `window.VtexAdsStories` with the same API as the npm
  package.

## Attributes

The element requests the placement's Stories from the VTEX Ads ad API with
[`@vtex/ads-core`](../core) and shows them in a carousel (see
[Layout](#layout)).

| Attribute           | Required | Description                                                                                                                                                                             |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publisher-id`      | Yes      | The publisher the ads are requested for                                                                                                                                                 |
| `session-id`        | Yes      | The store's session id. Use the same one sent with the store's other ad events                                                                                                          |
| `placement`         | Yes      | The Story placement configured for the publisher                                                                                                                                        |
| `user-id`           | No       | The shopper's id, when known                                                                                                                                                            |
| `account-name`      | No       | The VTEX account name                                                                                                                                                                   |
| `channel`           | No       | `site` or `app`. Other values are not sent                                                                                                                                              |
| `timeout`           | No       | Time limit for the ad request, in milliseconds. Default `2000`                                                                                                                          |
| `quantity`          | No       | How many Stories to request: the carousel positions. Default `8`. Below `1` or not a number: the default                                                                                |
| `inactive-autoplay` | No       | With more than one Story, the visible cards without the highlight also play their video, muted. On when present without a value or `"true"`; off by default, they show only their cover |

The element renders nothing while the request is pending, when a required
attribute is missing, when the request fails or takes longer than `timeout`,
or when the placement has no Story. Changing any of these attributes, except
`timeout` and `inactive-autoplay`, requests the Stories again; a new
`timeout` applies to the next request.

## Customization

```css
vtex-ads-story {
  --vtex-ads-story-font-family: "Inter", sans-serif;
  --vtex-ads-story-color-text: #1f1f1f;
  --vtex-ads-story-radius: 20px;
  --vtex-ads-story-solo-background: #fafafa;
}
```

| Variable                           | Default   | Used for                                   |
| ---------------------------------- | --------- | ------------------------------------------ |
| `--vtex-ads-story-font-family`     | inherited | All text                                   |
| `--vtex-ads-story-color-text`      | inherited | All text                                   |
| `--vtex-ads-story-radius`          | `20px`    | Card and background corners                |
| `--vtex-ads-story-solo-background` | `#fafafa` | Background behind the card, with one Story |

## Layout

The element requests up to `quantity` Stories and lays them out in a 500px tall
band as wide as its parent:

- **One Story**: the card is centered over a background. On screens 576px wide
  or less, the card shows alone, without the background.
- **Two Stories**: both cards side by side. One has the highlight (full size);
  the other is smaller and dimmed.
- **Three or more**: the highlighted card in the middle, the others on each
  side, smaller and dimmed, up to two per side. Every card moves one place per
  step. With four, the Story opposite the highlighted one shows at both ends.
  Two Stories also show this way on screens 576px wide or less, with the other
  one on both sides.

With more than one Story, the highlight moves to the next card every 5 seconds,
except while the pointer is over the carousel, the keyboard focus is in it, or
the player is open. It also moves with the arrows, a swipe, or a click on a
dimmed card. If the highlighted card's sound is on, the next highlighted card
plays with sound too, or muted if the browser blocks it.

### Player

Clicking the highlighted card opens it in the mini player, at the bottom right
of the screen, which can be expanded. With more than one Story:

- **Mini player**: previous and next buttons above its top left change the video
  in the player, and the carousel highlight follows. The carousel's own advance
  stays stopped while the player is open.
- **Expanded player**: the other Stories' covers sit beside the video, up to two
  per side (click one to watch it), with previous and next beside it. When the
  video ends, the next Story plays. With two Stories, the video moves off center
  with the other cover beside it, without previous and next. On screens 576px
  wide or less, it fills the screen, without the covers, and previous and next
  sit inside the video's edges.
- **Keyboard**: with the focus in the player, the left and right arrow keys step
  too (not with a modifier key held). Elsewhere on the page they keep working as
  usual.

## Development

Run from the repository root:

```bash
pnpm stories:dev
```

This starts a dev server with `index.html`, reloading on save.

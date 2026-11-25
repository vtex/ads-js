---
sidebar_position: 1
---

# Content Security Policy

A store with a Content-Security-Policy (CSP) must allow the hosts the SDK
reaches: the ad API, the event URLs, the ad media and the product images. A
blocked host shows as a CSP violation in the browser console, and what it
serves is missing: no ads, a card without its video, or events that are never
counted.

## Hosts to allow

| Directive     | Host                                                        | What for                                                                                                      |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `connect-src` | `https://newtail-media.newtail.com.br`                      | The ad API: the ad request of `@vtex/ads-core`, `@vtex/ads-react` and `@vtex/ads-stories`                     |
| `connect-src` | `https://events.newtail-media.newtail.com.br`               | The event URLs (`impression_url`, `view_url`, `click_url`) of the ad response (see [Event host](#event-host)) |
| `connect-src` | `https://<account>.vtexcommercestable.com.br`               | Product hydration from Intelligent Search, with `account-name` (Stories) or `accountName` (core)              |
| `media-src`   | `https://cdn.newtail.com.br`, `https://cdn2.newtail.com.br` | Story videos                                                                                                  |
| `img-src`     | `https://cdn.newtail.com.br`, `https://cdn2.newtail.com.br` | Story covers and banner images                                                                                |
| `img-src`     | The store's catalog image hosts                             | Product images (see [Product images](#product-images))                                                        |
| `script-src`  | `https://unpkg.com` or `https://cdn.jsdelivr.net`           | Only for the Stories CDN script (see [Stories quickstart](../ads-stories/quickstart.md))                      |

Events are sent with `navigator.sendBeacon` or `fetch`, and both follow
`connect-src`. `@vtex/ads-stories` sends them itself; with `@vtex/ads-core`, the
store sends them, so the event host is only needed if it sends them from the
browser.

A store with its own product hydration strategy (`fetcher`) must also allow
the hosts that strategy calls, instead of Intelligent Search.

### Event host

The event URLs come in the ad response, and VTEX Ads can set a publisher up
with an event host other than the default. If events are blocked, check the
host of `impression_url` in the ad API's response (in the browser's network
tab) and allow that one.

### Product images

A product's `image_url` is the store's own catalog image, sent as is: VTEX
Ads doesn't copy it. On VTEX stores, that is usually `https://*.vteximg.com.br`
or `https://*.vtexassets.com`. The store's `img-src` likely allows these
already.

## Styles

`@vtex/ads-stories` needs no `'unsafe-inline'` in `style-src`. Its styles are
constructable stylesheets in its shadow DOM, and the few styles it sets on
elements go through the CSSOM, which CSP doesn't block.

Browsers without constructable stylesheets (Safari before 16.4) get the
styles as `<style>` elements instead. To keep those working without
`'unsafe-inline'`, set the page's nonce in `window.litNonce` before the
element loads:

```html
<script nonce="the-page-nonce">
  window.litNonce = "the-page-nonce";
</script>
```

## Example

A policy for a VTEX store running the Stories carousel from npm, with the
other directives the store already has left out:

```http
Content-Security-Policy:
  connect-src 'self' https://newtail-media.newtail.com.br
    https://events.newtail-media.newtail.com.br
    https://mystore.vtexcommercestable.com.br;
  media-src 'self' https://cdn.newtail.com.br https://cdn2.newtail.com.br;
  img-src 'self' https://cdn.newtail.com.br https://cdn2.newtail.com.br
    https://*.vteximg.com.br https://*.vtexassets.com;
```

With the CDN script, add its host to `script-src`.

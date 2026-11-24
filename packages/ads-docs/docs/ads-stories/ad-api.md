---
sidebar_position: 6
---

# Ad API

`<vtex-ads-story-carousel>` does everything on this page for the store. A
store that builds its own carousel, or a native app, calls the ad API itself
and must then show the Stories and send their events as described here. The
element is the reference: when in doubt, do what it does (see
[Layout and player](./layout-and-player.md) and [Events](./events.md#ad-events)).

## Request

A `POST` to the ad API, with the publisher in the path and a JSON body:

```http
POST https://newtail-media.newtail.com.br/v1/rma/<publisher-id>
Content-Type: application/json
```

```json
{
  "session_id": "the-store-session-id",
  "user_id": "the-shopper-opaque-id",
  "context": "home",
  "channel": "site",
  "placements": {
    "home_stories": { "types": ["story"], "quantity": 8 }
  }
}
```

| Field                     | Required | Description                                                                                           |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `session_id`              | Yes      | The store's session id. The same one goes in every event                                              |
| `user_id`                 | No       | The shopper's opaque id. Never personal data (see [Personal data](../guides/personal-data.md))        |
| `context`                 | Yes      | The page type: `home`, `search`, `category`, `brand_page` or `product_page`. The element sends `home` |
| `channel`                 | No       | `site` or `app`                                                                                       |
| `placements`              | Yes      | The Story placement configured for the publisher, as the key                                          |
| `placements.<p>.types`    | Yes      | `["story"]`                                                                                           |
| `placements.<p>.quantity` | Yes      | How many Stories: the carousel positions. One campaign is one Story; with fewer eligible, fewer come  |

The element gives up after 2 seconds and then renders nothing; a store should
also set a time limit, so a slow ad API doesn't hold the page.

## Response

The placement's key holds one item per Story, in carousel order. Other keys,
such as `request_id`, identify the request.

```json
{
  "home_stories": [
    {
      "type": "story",
      "ad_id": "8f2c…",
      "campaign_id": "51ab…",
      "seller_id": "1",
      "position": 0,
      "campaign_name": "Spring sale",
      "asset_type": "video",
      "media_url": "https://cdn.newtail.com.br/retail_media/ads-video/story/…/2026/10/16/….mp4",
      "poster_url": "https://cdn.newtail.com.br/retail_media/ads-video/story/…/2026/10/16/….jpg",
      "duration_seconds": 14,
      "call_to_action": null,
      "destination_url": "https://www.mystore.com/sneaker/p",
      "product": {
        "product_sku": "1234",
        "seller_id": "1",
        "product_name": "Sneaker",
        "image_url": "https://mystore.vteximg.com.br/arquivos/ids/1234/sneaker.jpg",
        "url": "https://www.mystore.com/sneaker/p",
        "product_metadata": { "price": 299.9, "promotional_price": 249.9 }
      },
      "impression_url": "https://events.newtail-media.newtail.com.br/v1/beacon/impression/8f2c…",
      "view_url": "https://events.newtail-media.newtail.com.br/v1/beacon/view/8f2c…",
      "click_url": "https://events.newtail-media.newtail.com.br/v1/beacon/click/8f2c…"
    }
  ],
  "request_id": "…"
}
```

| Field                                       | Description                                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                                      | Always `story`                                                                                                                                 |
| `ad_id`, `campaign_id`, `campaign_name`     | The ad and its campaign, for diagnosis. One campaign has one Story                                                                             |
| `seller_id`                                 | The ad's seller, when there is one                                                                                                             |
| `position`                                  | The Story's place in the carousel, from 0                                                                                                      |
| `asset_type`                                | Always `video`                                                                                                                                 |
| `media_url`                                 | The video: a 9:16 MP4 (1080 × 1920, H.264, up to 60 seconds), with or without sound                                                            |
| `poster_url`                                | The cover: a 1080 × 1920 JPG, shown until the video plays                                                                                      |
| `duration_seconds`                          | The video's length, in whole seconds                                                                                                           |
| `destination_url`                           | Where the Story leads: the product page, or the advertiser's link                                                                              |
| `product`                                   | The featured product, or `null` when the destination is a link (see [Destination](#destination))                                               |
| `product.product_sku`, `product.seller_id`  | The SKU and its seller, for the store's cart. `seller_id` can be missing                                                                       |
| `product.product_name`, `product.image_url` | The product's name and image, from the store's catalog                                                                                         |
| `product.product_metadata`                  | What the catalog indexed. Can be empty. When present, `price` is the regular price and `promotional_price` the sale price (0 or missing: none) |
| `call_to_action`                            | The call to action's text, set in the campaign. Only with a link destination; otherwise `null`                                                 |
| `impression_url`, `view_url`, `click_url`   | Where to send each event (see [Events](#events))                                                                                               |

Without eligible Stories, the placement comes back as an empty list. The
element then renders nothing, and so it does on an error or a timeout; the
space is the store's to fill.

### Destination

A Story leads to a product or to a link:

- **Product**: `product` is set and `destination_url` is the product page.
  Show the product with add to cart, which the store handles, and a link to
  `destination_url`.
- **Link**: `product` is `null` and `destination_url` is the advertiser's
  link. Show a call to action with the `call_to_action` text. The element shows
  none when the text is `null`.

Only follow a `destination_url` that is an absolute `http(s)` URL or a path on
the store (`/sneaker/p`). The element ignores anything else, including paths
that lead to another host (`//host`, `/\host`).

The price in `product_metadata` is the one indexed with the campaign, and can
be stale or missing. VTEX stores can read the current price and availability
from Intelligent Search by `product_sku`, as the element does (see
[Product hydration](./product-hydration.md)).

### Media

Play `media_url` inline, muted and looping on the cards (browsers only
autoplay muted video), with `poster_url` as its cover. Turn the sound on only
when the shopper asks for it, as when they open the Story. When a link opens
the destination in a new tab, pause the video, or mute it if it keeps playing.

The media is served from `cdn.newtail.com.br` or `cdn2.newtail.com.br`: a
store with a Content-Security-Policy must allow them (see
[Content Security Policy](../guides/content-security-policy.md)).

## Events

Send each Story's impression, view and click to its URLs from the response,
exactly as they came: they carry the ad's data and a signature, so don't
build or change them. Send each at most once per Story and session:

- **Impression**: when the carousel shows the Stories, for every Story in the
  response, on screen or not.
- **View**: when the Story's video plays for 2 continuous seconds with at
  least 50% of it on screen and the page visible.
- **Click**: on the shopper's first touch on the Story: the card, its video,
  product or call to action.

Each event is a `POST` with the session, and the user when known, in a JSON
body:

```js
navigator.sendBeacon(
  story.impression_url,
  new Blob([JSON.stringify({ session_id: sessionId, user_id: userId })], {
    type: "text/plain;charset=utf-8",
  }),
);
```

`sendBeacon` keeps the event when the shopper leaves the page, and the
`text/plain` type needs no CORS preflight; a native app sends the same `POST`
with its HTTP client. Leave out `user_id` when there is none.

The server also counts each event once per session and ad: impression and view
within 5 minutes, click within 1 hour. That covers a repeated event, not a
missing one: the store must still send each one when its rule is met.

Conversions aren't Story events: they keep coming from the store's VTEX Ads
conversion integration.

## Checklist

- [ ] The ad request has the Story placement, `types: ["story"]`, the session
      and a time limit.
- [ ] An empty list, an error or a timeout leaves the space to the store.
- [ ] Each card shows `poster_url`, then plays `media_url` muted and inline.
- [ ] A product destination shows the product, add to cart and a link to
      `destination_url`; a link destination, the call to action.
- [ ] `destination_url` is followed only when it is `http(s)` or a store path.
- [ ] Impression, view and click go to their URLs as they came, once per Story
      and session, with `session_id`.
- [ ] `user_id` is an opaque id, or left out.
- [ ] The CSP allows the ad API, the event host and the media CDN.

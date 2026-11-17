---
sidebar_position: 2
---

# Configuration

## Attributes

The element requests the placement's Stories from the VTEX Ads ad API with
[`@vtex/ads-core`](../ads-core/quickstart.md) and shows them in a carousel
(see [Layout and player](./layout-and-player.md)).

| Attribute            | Required | Description                                                                                                                                                                             |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `publisher-id`       | Yes      | The publisher the ads are requested for                                                                                                                                                 |
| `session-id`         | Yes      | The store's session id. Use the same one sent with the store's other ad events                                                                                                          |
| `placement`          | Yes      | The Story placement configured for the publisher                                                                                                                                        |
| `user-id`            | No       | The shopper's id, when known                                                                                                                                                            |
| `account-name`       | No       | The VTEX account name. Also turns on the product hydration from Intelligent Search (see [Product hydration](./product-hydration.md))                                                    |
| `channel`            | No       | `site` or `app`. Other values are not sent                                                                                                                                              |
| `timeout`            | No       | Time limit for the ad request, in milliseconds. Default `2000`                                                                                                                          |
| `quantity`           | No       | How many Stories to request: the carousel positions. Default `8`. Below `1` or not a number: the default                                                                                |
| `currency`           | No       | Currency of the product prices, as an ISO 4217 code (`BRL`, `ARS`). Default `BRL`. An invalid code uses the default                                                                     |
| `label-add-to-cart`  | No       | The add to cart button's text. Missing or blank: the default in the element's language (see [Language](#language))                                                                      |
| `label-view-product` | No       | The view product button's text. Missing or blank: the default in the element's language                                                                                                 |
| `inactive-autoplay`  | No       | With more than one Story, the visible cards without the highlight also play their video, muted. On when present without a value or `"true"`; off by default, they show only their cover |
| `slide-duration`     | No       | With more than one Story, how long each one stays highlighted before the next, in milliseconds. Default `5000`. `0`: no automatic advance. Maximum `120000`: larger values are capped   |
| `hydration`          | No       | `none`: no product request. Any other value is ignored. To set a strategy, use the `hydration` property (see [Product hydration](./product-hydration.md))                               |
| `hydration-timeout`  | No       | Time limit for the product request, in milliseconds. Default `5000`                                                                                                                     |

## Loading and errors

While the request is pending, and then until the first Story's cover or video
loads, whichever comes first (up to 3 seconds), the element shows a skeleton
of the carousel. The videos start, from the beginning, when the skeleton
leaves.

It renders nothing when a required attribute is missing, when the request
fails or takes longer than `timeout`, or when the placement has no Story. A
failed request (other than one that took longer than `timeout`) is logged to
the console, so it can be told apart from a placement with no Story.

## Changing attributes

Changing any attribute requests the Stories again, except `timeout`,
`hydration-timeout`, `inactive-autoplay`, `slide-duration`, `currency`,
`label-add-to-cart` and `label-view-product`. A new time limit applies to the
next request, and a new `slide-duration` starts the highlighted Story's time
over.

## Language

The element's texts (buttons, "Sold out", the video notices and the names
screen readers read out) and its prices follow the language of the closest
element with a `lang` attribute, the element itself included: usually
`<html lang>`, or `<vtex-ads-story-carousel lang="es-AR">` for the widget
alone. The texts come in Portuguese, Spanish and English, picked by the
language alone (`es-AR` and `es-MX` both get Spanish). Without a `lang`, or
with another language, they are in Portuguese and prices use `pt-BR`.

These docs quote the English texts (**Add to cart**, **Sold out**); a page
without a `lang` shows them in Portuguese.

`label-add-to-cart` and `label-view-product` replace those two buttons' texts
in any language:

```html
<vtex-ads-story-carousel
  lang="es-AR"
  label-add-to-cart="Comprar"
  label-view-product="Ver detalles"
  ...
></vtex-ads-story-carousel>
```

The call to action's text comes from the campaign.

## Customization

The element's look is set with CSS variables on the element, or on any
ancestor:

```css
vtex-ads-story-carousel {
  --vtex-ads-story-font-family: "Inter", sans-serif;
  --vtex-ads-story-color-text: #1f1f1f;
  --vtex-ads-story-color-muted: #6b6b6b;
  --vtex-ads-story-color-surface: #fff;
  --vtex-ads-story-color-accent: #1b75a8;
  --vtex-ads-story-color-accent-contrast: #fff;
  --vtex-ads-story-radius: 20px;
}
```

| Variable                                 | Default                                                              | Used for                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--vtex-ads-story-font-family`           | inherited                                                            | All text                                                                                                                                                                                                                                                                                                                                                                |
| `--vtex-ads-story-color-text`            | inherited (`#242424` in the panel)                                   | All text off the video, such as the open product panel's                                                                                                                                                                                                                                                                                                                |
| `--vtex-ads-story-color-muted`           | `#6b6b6b`                                                            | The panel's "from" price and its disabled add to cart                                                                                                                                                                                                                                                                                                                   |
| `--vtex-ads-story-color-surface`         | `#fff` (`#fafafa` behind the card)                                   | The open product panel, the view product button, and the background behind a single Story                                                                                                                                                                                                                                                                               |
| `--vtex-ads-story-color-accent`          | `#1b75a8`                                                            | The product panel's buttons                                                                                                                                                                                                                                                                                                                                             |
| `--vtex-ads-story-color-accent-contrast` | `#fff`                                                               | Text on the add to cart button                                                                                                                                                                                                                                                                                                                                          |
| `--vtex-ads-story-radius`                | `20px` on the cards, `16px` on the pills, fully round on the buttons | The cards, the background behind a single Story, the covers beside the expanded video, the player's dim overlay, the product and call to action pills, the product thumbnail (the pill's radius minus 8px), the panel's buttons including the quantity stepper's, and the video's retry button; `0px` makes them square. The round icon buttons on the video stay round |

Text over the video stays white: it sits on the video, not on a store color.

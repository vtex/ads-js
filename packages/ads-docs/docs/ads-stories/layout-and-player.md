---
sidebar_position: 3
---

# Layout and Player

## Carousel

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

With more than one Story, the highlight moves to the next card every
`slide-duration` (5 seconds by default), except while the pointer is over the
carousel, the keyboard focus is in it, or the player is open. It also moves
with the arrows, a swipe, or a click on a dimmed card. If the highlighted
card's sound is on, the next highlighted card plays with sound too, or muted if
the browser blocks it.

Only the highlighted card plays its video; the others show their cover. With
`inactive-autoplay`, the visible cards without the highlight also play, muted.

### Reduced motion

For shoppers whose system asks for reduced motion
(`prefers-reduced-motion: reduce`), the carousel holds still: the cards show
only their cover, with no video playing, and the highlight doesn't advance on
its own, whatever `slide-duration` or `inactive-autoplay` say. It moves only
with the arrows, swipes and clicks. Opening a Story plays its video in the
player as usual, since the shopper chose to watch it.

## Product

When the Story's destination is a product, the card shows it at the bottom: its
image, its name (up to two lines) and its price. On sale, the "from" price
shows struck through beside it. Prices are formatted in the element's language
(see [Language](./configuration.md#language)) and in `currency`.

In the player, the same product sits at the bottom of the video. Clicking it
opens a panel with an add to cart button and a view product link (the product
page, in a new tab). Clicking the product on the highlighted card opens the
player with the panel already open; on another card, it moves the highlight, as
the card does. Clicking the video or moving to another Story closes the panel.

Add to cart dispatches an event for the store to handle (see
[Commerce events](./events.md#commerce-events)); the player and the panel stay
open. A product without a SKU has no add to cart.

### Cart stepper

Once added, a stepper takes add to cart's place: minus, the quantity and plus.
With one left, minus is a trash that removes it, and add to cart comes back.

The quantity counts what was added and removed, for each SKU and seller, since
the player opened: the element doesn't read the store's cart, so an item added
or removed elsewhere, or a failed add, doesn't change it. Opening the player
again starts the count over, with add to cart; the store's cart keeps what was
added.

### Sold out

When the [hydration strategy](./product-hydration.md#availability) says a
product can't be bought, the card and the player keep showing its price (or
**Sold out** in its place when there is none), add to cart becomes a disabled
**Product unavailable**, and **View product** still opens the product page. The
Story keeps playing.

## Call to action

When the Story's destination is a link (no product), the card and the player
show a call to action at the bottom instead: a button with the text set in the
campaign (the ad's `call_to_action`, such as "Learn more") and a caret, which
opens the link in a new tab. On a card without the highlight, it moves the
highlight, as the card does. Without a text, there is no button.

## Destination

The Story's `destination_url`, the product page or the call to action's link,
can be an absolute http(s) URL or a path on the store (`/product/p`), which
opens on the store the element runs in. A path that would lead to another host
(`//host`, `/\host`) is ignored: the Story then shows no view product link, or
no call to action.

## Player

Clicking the highlighted card opens it in the mini player, at the bottom right
of the screen, which can be expanded. Its video plays with the sound on, or
muted if the browser blocks it. The player closes from its close button, with
Escape, or by clicking the backdrop of the expanded player.

With more than one Story:

- **Mini player**: previous and next buttons above its top left change the
  video in the player, and the carousel highlight follows. The carousel's own
  advance stays stopped while the player is open.
- **Expanded player**: the other Stories' covers sit beside the video, up to two
  per side (click one to watch it), with previous and next beside it. When the
  video ends, the next Story plays. With two Stories, the video moves off
  center with the other cover beside it, without previous and next. On screens
  576px wide or less, it fills the screen, without the covers, and previous and
  next sit inside the video's edges.
- **Keyboard**: with the focus in the player, the left and right arrow keys
  step too (not with a modifier key held). Elsewhere on the page they keep
  working as usual.

## Video errors

A video that can't load leaves its cover with a notice over it. On the card,
it says **Video unavailable**. In the player, it says **Couldn't load the
video**, with a **Try again** button: a spinner (**Loading video**) shows
until the video loads and plays with the sound on (muted if the browser blocks
it), or the notice comes back if it fails again.

The texts on this page are the English ones; the element shows them in its
language, Portuguese by default (see [Language](./configuration.md#language)).

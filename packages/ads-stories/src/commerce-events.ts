/**
 * The commerce events the element hands to the store: it has no cart of its
 * own. They bubble and cross shadow roots, so the store can listen on the
 * element, the document or any ancestor.
 */

/**
 * Add to cart, or the stepper's plus, was clicked in the player. No default
 * action.
 */
export const ADD_TO_CART_EVENT = "vtex-ads-story:add-to-cart";

/**
 * The stepper's minus, or its trash with one left, was clicked in the
 * player. No default action.
 */
export const REMOVE_FROM_CART_EVENT = "vtex-ads-story:remove-from-cart";

interface StoryCartEventDetail {
  /** The Story product's SKU, from the ad API (`product.product_sku`). */
  sku: string;
  /**
   * The product's seller, from the ad API (`product.seller_id`). Missing
   * when the ad API doesn't send one.
   */
  seller?: string;
  /** How many to add (or, removing, to remove). Always 1 for now. */
  quantity: number;
}

/** The detail of the add to cart event: `quantity` is how many to add. */
export type StoryAddToCartDetail = StoryCartEventDetail;

/** The detail of remove from cart: `quantity` is how many to remove. */
export type StoryRemoveFromCartDetail = StoryCartEventDetail;

/** The product an event is about: its SKU and, when known, its seller. */
export type StoryCartItem = Pick<StoryCartEventDetail, "sku" | "seller">;

export type StoryAddToCartEvent = CustomEvent<StoryAddToCartDetail>;
export type StoryRemoveFromCartEvent = CustomEvent<StoryRemoveFromCartDetail>;

function cartEvent(
  type: typeof ADD_TO_CART_EVENT | typeof REMOVE_FROM_CART_EVENT,
  { sku, seller }: StoryCartItem,
  quantity: number,
): CustomEvent<StoryCartEventDetail> {
  return new CustomEvent<StoryCartEventDetail>(type, {
    detail: { sku, ...(seller && { seller }), quantity },
    bubbles: true,
    composed: true,
  });
}

/**
 * The add to cart event for `item`, bubbling and composed, to dispatch from
 * the element. `quantity` defaults to 1.
 */
export function addToCartEvent(
  item: StoryCartItem,
  quantity = 1,
): StoryAddToCartEvent {
  return cartEvent(ADD_TO_CART_EVENT, item, quantity);
}

/**
 * The remove from cart event for `item`, bubbling and composed, to dispatch
 * from the element. `quantity` (how many to remove) defaults to 1.
 */
export function removeFromCartEvent(
  item: StoryCartItem,
  quantity = 1,
): StoryRemoveFromCartEvent {
  return cartEvent(REMOVE_FROM_CART_EVENT, item, quantity);
}

// Types `addEventListener("vtex-ads-story:add-to-cart", …)` and
// "vtex-ads-story:remove-from-cart" on any element, the document and the
// window.
declare global {
  interface HTMLElementEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
    [REMOVE_FROM_CART_EVENT]: StoryRemoveFromCartEvent;
  }
  interface DocumentEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
    [REMOVE_FROM_CART_EVENT]: StoryRemoveFromCartEvent;
  }
  interface WindowEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
    [REMOVE_FROM_CART_EVENT]: StoryRemoveFromCartEvent;
  }
}

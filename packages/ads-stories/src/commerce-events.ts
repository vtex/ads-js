/**
 * The commerce events the element hands to the store: it has no cart of its
 * own. They bubble and cross shadow roots, so the store can listen on the
 * element, the document or any ancestor.
 */

/** Add to cart was clicked in the player. No default action. */
export const ADD_TO_CART_EVENT = "vtex-ads-story:add-to-cart";

export interface StoryAddToCartDetail {
  /** The Story product's SKU, from the ad API (`product.product_sku`). */
  sku: string;
  /** How many to add. Always 1 for now. */
  quantity: number;
}

export type StoryAddToCartEvent = CustomEvent<StoryAddToCartDetail>;

export function addToCartEvent(sku: string, quantity = 1): StoryAddToCartEvent {
  return new CustomEvent<StoryAddToCartDetail>(ADD_TO_CART_EVENT, {
    detail: { sku, quantity },
    bubbles: true,
    composed: true,
  });
}

// Types `addEventListener("vtex-ads-story:add-to-cart", …)` on any element,
// the document and the window.
declare global {
  interface HTMLElementEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
  }
  interface DocumentEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
  }
  interface WindowEventMap {
    [ADD_TO_CART_EVENT]: StoryAddToCartEvent;
  }
}

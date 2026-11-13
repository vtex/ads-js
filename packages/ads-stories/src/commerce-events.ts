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
  /**
   * The product's seller, from the ad API (`product.seller_id`). Missing
   * when the ad API doesn't send one.
   */
  seller?: string;
  /** How many to add. Always 1 for now. */
  quantity: number;
}

/** The product an event is about: its SKU and, when known, its seller. */
export type StoryCartItem = Pick<StoryAddToCartDetail, "sku" | "seller">;

export type StoryAddToCartEvent = CustomEvent<StoryAddToCartDetail>;

/**
 * The add to cart event for `item`, bubbling and composed, to dispatch from
 * the element. `quantity` defaults to 1.
 */
export function addToCartEvent(
  { sku, seller }: StoryCartItem,
  quantity = 1,
): StoryAddToCartEvent {
  return new CustomEvent<StoryAddToCartDetail>(ADD_TO_CART_EVENT, {
    detail: { sku, ...(seller && { seller }), quantity },
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

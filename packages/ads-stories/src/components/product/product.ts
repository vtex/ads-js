import { html, nothing } from "lit";
import type { StoryLabels } from "../../locales";
import { icon } from "../icons";
import { destinationUrl, httpUrl } from "../../utils/safe-url";
import type { StoryAd } from "../../types";
import type { StoryProductDetails } from "../../utils/hydrate-products";
import { readProductPrice } from "./price";

/** What the card shows of the Story's product, with the prices formatted. */
export interface CardProduct {
  name: string;
  imageUrl?: string;
  price?: string;
  /** The "from" price, struck through. Only with a price. */
  listPrice?: string;
  /** The product page, opened by view product link button. */
  url?: string;
  /** The SKU added to the cart. Without one, there is no add to cart. */
  sku?: string;
  /** The product's seller, sent with the SKU when known. */
  seller?: string;
  /** Accessible name of the product button: name and prices. */
  label: string;
  /**
   * The product's details are being fetched: placeholders show in their
   * place (for now, the price's).
   */
  isLoading?: boolean;
  /**
   * Set when the fetched product can't be bought: add to cart becomes a
   * disabled button, and without a price this text ("Esgotado") shows in its
   * place.
   */
  soldOut?: string;
}

/**
 * The Story's product as fetched: `"loading"` while the request runs, its
 * details once found, or undefined without them (no request, not found,
 * failed). Without a fetched price, the ad server's shows.
 */
export type FetchedProduct = StoryProductDetails | "loading" | undefined;

/**
 * The card's view of a Story's product, or undefined when the Story has none
 * (its destination is a link) or the product has no name.
 *
 * The price is the fetched one when there is one; while the product loads,
 * none; and otherwise the ad server's, from `product_metadata`. A fetched
 * product that can't be bought still shows its price, or `labels.soldOut`
 * when it has none.
 */
export function toCardProduct(
  story: Pick<StoryAd, "product" | "destination_url">,
  format: (amount: number) => string,
  labels: StoryLabels,
  fetched?: FetchedProduct,
): CardProduct | undefined {
  const product = story.product;
  const name = product?.product_name?.trim();
  if (!product || !name) return undefined;

  const base = {
    name,
    imageUrl: httpUrl(product.image_url) ?? undefined,
    url: destinationUrl(story.destination_url) ?? undefined,
    sku: product.product_sku?.trim() || undefined,
    seller: product.seller_id?.trim() || undefined,
  };

  if (fetched === "loading") {
    return { ...base, label: labels.product(name), isLoading: true };
  }
  const amounts = fetched?.price ?? readProductPrice(product.product_metadata);
  const price = amounts && format(amounts.price);
  const listPrice =
    amounts?.listPrice === undefined ? undefined : format(amounts.listPrice);
  const soldOut = fetched?.available === false ? labels.soldOut : undefined;

  return {
    ...base,
    price,
    listPrice,
    soldOut,
    label:
      soldOut && !price
        ? labels.product(name, soldOut)
        : labels.product(name, price, listPrice),
  };
}

const priceSkeleton = html`
  <span
    class="product-price product-loading product-price-loading"
    aria-hidden="true"
  ></span>
`;

// The add to cart button's place, while the product loads. Hidden from
// assistive technology, as the price's.
const addToCartSkeleton = html`
  <span
    class="product-loading product-add-to-cart-loading"
    aria-hidden="true"
  ></span>
`;

// The price and, on sale, the "from" price struck through beside it. While
// the product loads, its placeholder; sold out without a price, the sold out
// text; otherwise without a price, nothing.
function renderPrice({ isLoading, soldOut, price, listPrice }: CardProduct) {
  if (isLoading) return priceSkeleton;
  if (!price) {
    return soldOut
      ? html`<span class="product-price product-sold-out">${soldOut}</span>`
      : nothing;
  }

  return html`
    <span class="product-price">
      <span>${price}</span>
      ${listPrice
        ? html`<s class="product-list-price">${listPrice}</s>`
        : nothing}
    </span>
  `;
}

// Image, name and prices: what the pill shows.
function renderSummary(product: CardProduct) {
  return html`
    ${product.imageUrl
      ? html`<img class="product-image" alt="" src=${product.imageUrl} />`
      : nothing}
    <span class="product-info">
      <span class="product-name">${product.name}</span>
      ${renderPrice(product)}
    </span>
  `;
}

/**
 * The product pill on the carousel card: image, name (up to two lines),
 * price and, on sale, the "from" price struck through. Without a price, only
 * the name. A button of its own, beside the card's (a button can't contain
 * another).
 */
export function renderProduct(product: CardProduct, onSelect: () => void) {
  return html`
    <button
      type="button"
      class="card-product"
      aria-label=${product.label}
      @click=${onSelect}
    >
      ${renderSummary(product)}
    </button>
  `;
}

export interface ExpandableProductOptions {
  /** Whether the panel with the actions shows. */
  open: boolean;
  /** Called by the pill's button, to open or close the panel. */
  onToggle: () => void;
  /** Id of the panel, for the button's aria-controls. */
  panelId: string;
  /** The texts: add to cart, its disabled "unavailable" and view product. */
  labels: StoryLabels;
  /** Called by add to cart. */
  onAddToCart?: () => void;
}

// Add to cart: its placeholder while the product loads, and a disabled
// button when sold out. Nothing without a SKU.
function renderAddToCart(
  { isLoading, soldOut, sku }: CardProduct,
  { labels, onAddToCart }: ExpandableProductOptions,
) {
  if (!sku) return nothing;
  if (isLoading) return addToCartSkeleton;
  if (soldOut) {
    return html`
      <button type="button" class="product-action product-unavailable" disabled>
        ${labels.unavailable}
      </button>
    `;
  }
  return html`
    <button
      type="button"
      class="product-action product-add-to-cart"
      @click=${onAddToCart}
    >
      ${labels.addToCart}
    </button>
  `;
}

/**
 * The product pill in the player. The pill is a button that opens a panel
 * below it, as in the prototype, with "Adicionar ao carrinho" (a placeholder
 * while the product loads, a disabled "Produto indisponível" when sold out)
 * and "Ver produto" (the product page, in a new tab; only with a URL). Open,
 * the pill turns white.
 *
 * Add to cart calls `onAddToCart` and leaves the panel open.
 */
export function renderExpandableProduct(
  product: CardProduct,
  options: ExpandableProductOptions,
) {
  const { open } = options;

  return html`
    <div class="card-product product-expandable" ?data-open=${open}>
      <button
        type="button"
        class="product-summary"
        aria-label=${product.label}
        aria-expanded=${open ? "true" : "false"}
        aria-controls=${options.panelId}
        @click=${options.onToggle}
      >
        ${renderSummary(product)}
        <span class="product-toggle">${icon("caretUp")}</span>
      </button>
      <div id=${options.panelId} class="product-panel" ?inert=${!open}>
        <div class="product-actions">
          ${renderAddToCart(product, options)}
          ${product.url
            ? html`
                <a
                  class="product-action product-view"
                  href=${product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${options.labels.viewProduct}
                </a>
              `
            : nothing}
        </div>
      </div>
    </div>
  `;
}

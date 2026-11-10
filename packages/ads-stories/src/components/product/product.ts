import { html, nothing } from "lit";
import { icon } from "../icons";
import { httpUrl } from "../media";
import type { StoryAd } from "../../types";
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
  /** Accessible name of the product button: name and prices. */
  label: string;
}

/** Builds the product button's accessible name from its texts. */
export type ProductLabel = (
  name: string,
  price?: string,
  listPrice?: string,
) => string;

/**
 * The card's view of a Story's product, or undefined when the Story has none
 * (its destination is a link) or the product has no name.
 */
export function toCardProduct(
  story: Pick<StoryAd, "product" | "destination_url">,
  format: (amount: number) => string,
  label: ProductLabel,
): CardProduct | undefined {
  const product = story.product;
  const name = product?.product_name?.trim();
  if (!product || !name) return undefined;

  const amounts = readProductPrice(product.product_metadata);
  const price = amounts && format(amounts.price);
  const listPrice =
    amounts?.listPrice === undefined ? undefined : format(amounts.listPrice);

  return {
    name,
    imageUrl: httpUrl(product.image_url) ?? undefined,
    price,
    listPrice,
    url: httpUrl(story.destination_url) ?? undefined,
    label: label(name, price, listPrice),
  };
}

// The price and, on sale, the "from" price struck through beside it.
function renderPrice(price: string, listPrice?: string) {
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
      ${product.price ? renderPrice(product.price, product.listPrice) : nothing}
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
  addToCartLabel: string;
  viewProductLabel: string;
}

/**
 * The product pill in the player. The pill is a button that opens a panel
 * below it, as in the prototype, with "Adicionar ao carrinho" and "Ver
 * produto" (the product page, in a new tab; only with a URL). Open, the pill
 * turns white.
 *
 * Adding to the cart does nothing yet: it will emit an event for the store
 * to handle.
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
          <button type="button" class="product-action product-add-to-cart">
            ${options.addToCartLabel}
          </button>
          ${product.url
            ? html`
                <a
                  class="product-action product-view"
                  href=${product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${options.viewProductLabel}
                </a>
              `
            : nothing}
        </div>
      </div>
    </div>
  `;
}

import { html, nothing } from "lit";
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
  story: Pick<StoryAd, "product">,
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
function renderContent(product: CardProduct) {
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
 * The product pill: image, name (up to two lines), price and, on sale, the
 * "from" price struck through. Without a price, only the name.
 *
 * With onSelect, a button of its own, beside the card's (a button can't
 * contain another). Without it, for display only: screen readers read its
 * label ("Tênis, de R$ 159,90 por R$ 129,90") instead of the bare prices.
 */
export function renderProduct(product: CardProduct, onSelect?: () => void) {
  if (!onSelect) {
    return html`
      <div class="card-product">
        <span class="product-label">${product.label}</span>
        <span class="product-content" aria-hidden="true">
          ${renderContent(product)}
        </span>
      </div>
    `;
  }

  return html`
    <button
      type="button"
      class="card-product"
      aria-label=${product.label}
      @click=${onSelect}
    >
      ${renderContent(product)}
    </button>
  `;
}

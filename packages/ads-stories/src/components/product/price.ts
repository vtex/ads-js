/** Locale used when the element has none and the page has no `lang`. */
export const DEFAULT_LOCALE = "pt-BR";

/** Currency used when the element has none or an invalid one. */
export const DEFAULT_CURRENCY = "BRL";

/**
 * A product's price, as plain numbers. `listPrice` is the "from" price, only
 * present when it is above `price` (the product is on sale).
 */
export interface ProductPrice {
  price: number;
  listPrice?: number;
}

// A positive amount, from a number or a numeric string ("129.9").
function toAmount(value: unknown) {
  let amount = Number.NaN;
  if (typeof value === "number") amount = value;
  else if (typeof value === "string" && value.trim() !== "") {
    amount = Number(value);
  }
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

/**
 * Reads the price from a Story product's `product_metadata`, with the names
 * the ad platform uses for prices: `price` (regular) and `promotional_price`
 * (sale, 0 or missing when there is none). The ad API doesn't send a price
 * yet, so this is undefined for now unless the catalog indexed one.
 */
export function readProductPrice(
  metadata: Record<string, unknown> | undefined,
): ProductPrice | undefined {
  const regular = toAmount(metadata?.price);
  const promotional = toAmount(metadata?.promotional_price);

  if (
    promotional !== undefined &&
    (regular === undefined || promotional < regular)
  ) {
    return regular === undefined
      ? { price: promotional }
      : { price: promotional, listPrice: regular };
  }
  return regular === undefined ? undefined : { price: regular };
}

function isLocale(locale: string) {
  try {
    return Intl.getCanonicalLocales(locale).length > 0;
  } catch {
    return false;
  }
}

/**
 * Formats amounts as the given currency in the given locale ("R$ 129,90").
 * An empty or invalid locale falls back to DEFAULT_LOCALE, and an empty or
 * invalid currency (not a three-letter ISO 4217 code) to DEFAULT_CURRENCY.
 */
export function priceFormatter(locale?: string, currency?: string) {
  const format = new Intl.NumberFormat(
    locale && isLocale(locale) ? locale : DEFAULT_LOCALE,
    {
      style: "currency",
      currency:
        currency && /^[a-z]{3}$/i.test(currency) ? currency : DEFAULT_CURRENCY,
    },
  );
  return (amount: number) => format.format(amount);
}

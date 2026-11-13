import {
  hydrateAds,
  intelligentSearchAvailability,
  intelligentSearchFetcher,
  intelligentSearchMatcher,
  intelligentSearchPrice,
  type Identity,
  type Offer,
  type Product,
  type ProductFetcher,
  type ProductPrice,
} from "@vtex/ads-core";
import { TAG_NAME } from "../tag-name";
import type { StoryAd } from "../types";
import { withTimeout } from "./with-timeout";

const DEFAULT_HYDRATION_TIMEOUT_MS = 5000;

/**
 * Where the element gets its products' details: a fetcher and a matcher, as
 * in `@vtex/ads-core`, and a reader for the price of a fetched product.
 */
export interface StoryHydration<TProduct extends object = object> {
  fetcher: ProductFetcher<TProduct>;
  matcher(product: TProduct, offer: Offer): boolean;
  price(product: TProduct, offer: Offer): ProductPrice | undefined;
  /** Whether the product can be bought. Without it, it isn't checked. */
  available?(product: TProduct, offer: Offer): boolean | undefined;
}

export const intelligentSearchHydration: StoryHydration<Product> = {
  fetcher: intelligentSearchFetcher,
  matcher: intelligentSearchMatcher,
  price: intelligentSearchPrice,
  available: intelligentSearchAvailability,
};

export interface StoryProductDetails {
  price?: ProductPrice;
  /** Missing when the strategy doesn't say. */
  available?: boolean;
}

// A price the card can show: an amount (0 included, as the strategy says),
// with the "from" price only when it is above it, as intelligentSearchPrice
// reads them. A store's own reader may return anything (a missing amount,
// NaN, a string): then the ad server's price shows instead.
function toShownPrice(
  value: ProductPrice | undefined,
): ProductPrice | undefined {
  const isAmount = (amount: unknown): amount is number =>
    typeof amount === "number" && Number.isFinite(amount) && amount >= 0;

  if (!isAmount(value?.price)) return undefined;
  const { price, listPrice } = value;
  return isAmount(listPrice) && listPrice > price
    ? { price, listPrice }
    : { price };
}

export interface HydrateProductsOptions {
  signal?: AbortSignal;
  timeout?: number;
}

export async function hydrateStoryProducts(
  placement: string,
  stories: StoryAd[],
  hydration: StoryHydration,
  identity: Identity,
  { signal, timeout }: HydrateProductsOptions = {},
): Promise<Map<string, StoryProductDetails>> {
  const products = new Map<string, StoryProductDetails>();
  const limit = withTimeout(timeout, DEFAULT_HYDRATION_TIMEOUT_MS, signal);

  try {
    const hydrated = await hydrateAds(
      { stories: { [placement]: stories } },
      hydration.fetcher,
      (product, offer) => hydration.matcher(product, offer),
      identity,
      { signal: limit.signal },
    );

    for (const { story, product, offer } of hydrated.stories[placement] ?? []) {
      if (!product || !offer) continue;
      try {
        const price = toShownPrice(hydration.price(product, offer));
        const available = hydration.available?.(product, offer);
        products.set(story.ad_id, {
          ...(price && { price }),
          ...(available !== undefined && { available }),
        });
      } catch (error) {
        console.error(`[${TAG_NAME}] Product details failed`, error);
      }
    }
  } catch (error) {
    // As for the Story request: a cancelled or timed out request needs no
    // log, any other failure does.
    if (!limit.signal.aborted) {
      console.error(`[${TAG_NAME}] Product request failed`, error);
    }
  } finally {
    limit.clear();
  }

  return products;
}

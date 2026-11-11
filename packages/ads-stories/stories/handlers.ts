/*
 * MSW handlers for the ad server and Intelligent Search, set for every story
 * in .storybook/preview.ts.
 *
 * The ad server gives each Story placement the first test Stories (up to the
 * requested quantity), with the delay and count set for it in SCENARIOS.
 * Intelligent Search answers each account in SEARCH_SCENARIOS after its
 * delay, or with an error, with the products in SEARCH_PRODUCTS.
 */
import { delay, http, HttpResponse } from "msw";
import { mockStories } from "../src/story/story.mock";

const AD_SERVER = "https://newtail-media.newtail.com.br/v1/rma/*";

type Scenario = { delayMs: number; count: number };

// How the mock answers each placement. Any other placement gets the default.
// delayMs simulates the ad server latency; count is how many Stories the
// placement has (0: none).
const SCENARIOS: Record<string, Scenario> = {
  default: { delayMs: 500, count: 1 },
  two_stories: { delayMs: 500, count: 2 },
  three_stories: { delayMs: 500, count: 3 },
  four_stories: { delayMs: 500, count: 4 },
  slow_stories: { delayMs: 3000, count: 1 },
  empty_stories: { delayMs: 500, count: 0 },
};

const scenarioFor = (placement: string) =>
  SCENARIOS[placement] ?? SCENARIOS.default;

type SearchScenario = { delayMs: number; status?: number };

// How the Intelligent Search mock answers each account-name.
const SEARCH_SCENARIOS: Record<string, SearchScenario> = {
  playground: { delayMs: 2000 },
  "playground-slow": { delayMs: 8000 },
  "playground-error": { delayMs: 1000, status: 500 },
};

type SearchEntry = {
  productId: string;
  Price: number;
  ListPrice: number;
  Stock: number;
};

// The catalog behind the mock, by SKU: what Intelligent Search sends for the
// test Stories' products, sold by seller 1.
const SEARCH_PRODUCTS: Record<string, SearchEntry> = {
  "sku-1": { productId: "1", Price: 99.9, ListPrice: 149.9, Stock: 10 },
  "sku-2": { productId: "2", Price: 79.9, ListPrice: 79.9, Stock: 0 },
  "sku-3": { productId: "3", Price: 49.9, ListPrice: 59.9, Stock: 10 },
};

const SEARCH =
  /^https:\/\/[^.]+\.vtexcommercestable\.com\.br\/api\/intelligent-search\/product_search/;

// An Intelligent Search product, with only what the hydration reads.
const searchProduct = (
  skuId: string,
  { productId, Price, ListPrice, Stock }: SearchEntry,
) => ({
  productId,
  items: [
    {
      itemId: skuId,
      sellers: [
        {
          sellerId: "1",
          commertialOffer: { Price, ListPrice, AvailableQuantity: Stock },
        },
      ],
    },
  ],
});

type PlacementRequest = { quantity: number; types: string[] };

export const handlers = [
  http.post(AD_SERVER, async ({ request }) => {
    const { placements } = (await request.json()) as {
      placements: Record<string, PlacementRequest>;
    };
    const requested = Object.entries(placements);

    // One response for all placements: it takes as long as the slowest.
    await delay(
      Math.max(
        ...requested.map(([placement]) => scenarioFor(placement).delayMs),
      ),
    );

    const body: Record<string, unknown> = { request_id: "playground" };
    for (const [placement, { quantity, types }] of requested) {
      const { count } = scenarioFor(placement);
      body[placement] = types.includes("story")
        ? mockStories.slice(0, Math.min(count, quantity))
        : [];
    }
    return HttpResponse.json(body);
  }),

  // Answers `q=sku:a;b` and `q=product:1;2` with the products found.
  http.get(SEARCH, async ({ request }) => {
    const url = new URL(request.url);
    const [account] = url.hostname.split(".");
    const scenario = SEARCH_SCENARIOS[account] ?? { delayMs: 500 };
    await delay(scenario.delayMs);
    if (scenario.status) {
      return HttpResponse.json({}, { status: scenario.status });
    }

    const [field, ids = ""] = (url.searchParams.get("q") ?? "").split(":");
    const wanted = new Set(ids.split(";"));
    const products = Object.entries(SEARCH_PRODUCTS)
      .filter(([skuId, { productId }]) =>
        wanted.has(field === "sku" ? skuId : productId),
      )
      .map(([skuId, product]) => searchProduct(skuId, product));

    return HttpResponse.json({ products });
  }),
];

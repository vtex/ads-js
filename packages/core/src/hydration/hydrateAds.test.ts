import { describe, it, expect, vi } from "vitest";
import { mockStory } from "../clients/adServer/story.mock";
import type {
  SponsoredProductDetail,
  StoryAdDetail,
} from "../clients/adServer/types";
import { hydrateAds } from "./hydrateAds";
import type { Offer, ProductFetcher, ProductMatchesOffer } from "./types";

interface TestProduct {
  sku: string;
  seller: string;
}

const identity = {
  accountName: "acme",
  publisherId: "publisher-1",
  sessionId: "session-1",
};

const matcher: ProductMatchesOffer<TestProduct> = (product, offer) =>
  product.sku === offer.skuId && product.seller === offer.sellerId;

// Finds every offer except those of `missing` SKUs.
const fetcherFinding = (...missing: string[]) =>
  vi.fn<ProductFetcher<TestProduct>>(async (offers: Offer[]) =>
    offers
      .filter((offer) => !missing.includes(offer.skuId))
      .map((offer) => ({ sku: offer.skuId, seller: offer.sellerId })),
  );

const sponsored = (sku: string): SponsoredProductDetail => ({
  click_url: `https://events.example.com/click/${sku}`,
  impression_url: `https://events.example.com/impression/${sku}`,
  view_url: `https://events.example.com/view/${sku}`,
  product_name: `Product ${sku}`,
  product_sku: sku,
  seller_id: "1",
  product_metadata: { productId: `p-${sku}` },
});

const story = (adId: string, sku?: string): StoryAdDetail => ({
  ...mockStory,
  ad_id: adId,
  product: sku ? { ...mockStory.product!, product_sku: sku } : null,
});

describe("hydrateAds", () => {
  it("finds the sponsored products and the Stories' products in one call", async () => {
    const fetcher = fetcherFinding();

    await hydrateAds(
      {
        sponsoredProducts: { search_top: [sponsored("10")] },
        stories: { home_stories: [story("s1", "20"), story("s2")] },
      },
      fetcher,
      matcher,
      identity,
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      [
        { skuId: "10", sellerId: "1", productId: "p-10" },
        { skuId: "20", sellerId: "1", productId: "" },
      ],
      identity,
      { signal: undefined },
    );
  });

  it("gives each Story found its product and keeps the others as sent", async () => {
    const linkStory = story("s3");
    const missingStory = story("s2", "21");

    const { stories } = await hydrateAds(
      {
        stories: {
          home_stories: [story("s1", "20"), missingStory, linkStory],
        },
      },
      fetcherFinding("21"),
      matcher,
      identity,
    );

    expect(stories.home_stories.map((s) => s.ad_id)).toEqual([
      "s1",
      "s2",
      "s3",
    ]);
    expect(stories.home_stories[0].hydratedProduct).toEqual({
      sku: "20",
      seller: "1",
    });
    expect(stories.home_stories[1]).toBe(missingStory);
    expect(stories.home_stories[2]).toBe(linkStory);
  });

  it("hydrates the sponsored products as getHydratedAds does", async () => {
    const found = sponsored("10");
    const missing = sponsored("11");

    const { sponsoredProducts } = await hydrateAds(
      { sponsoredProducts: { search_top: [found, missing] } },
      fetcherFinding("11"),
      matcher,
      identity,
    );

    expect(sponsoredProducts.byPlacement.search_top).toHaveLength(1);
    expect(sponsoredProducts.byPlacement.search_top[0].product).toEqual({
      sku: "10",
      seller: "1",
    });
    expect(sponsoredProducts.failed).toEqual([missing]);
  });

  it("makes no product request when there is no product to find", async () => {
    const fetcher = fetcherFinding();
    const linkStory = story("s1");

    const result = await hydrateAds(
      { stories: { home_stories: [linkStory] } },
      fetcher,
      matcher,
      identity,
    );

    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toEqual({
      sponsoredProducts: { byPlacement: {}, failed: [] },
      stories: { home_stories: [linkStory] },
    });
  });

  it("accepts no ads at all", async () => {
    const fetcher = fetcherFinding();

    const result = await hydrateAds({}, fetcher, matcher, identity);

    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toEqual({
      sponsoredProducts: { byPlacement: {}, failed: [] },
      stories: {},
    });
  });

  it("passes the signal to the fetcher", async () => {
    const fetcher = fetcherFinding();
    const { signal } = new AbortController();

    await hydrateAds(
      { stories: { home_stories: [story("s1", "20")] } },
      fetcher,
      matcher,
      identity,
      { signal },
    );

    expect(fetcher).toHaveBeenCalledWith(expect.any(Array), identity, {
      signal,
    });
  });

  it("rejects when the fetcher fails", async () => {
    const error = new Error("Search failed");
    const fetcher = vi.fn<ProductFetcher<TestProduct>>(async () => {
      throw error;
    });

    await expect(
      hydrateAds(
        { stories: { home_stories: [story("s1", "20")] } },
        fetcher,
        matcher,
        identity,
      ),
    ).rejects.toBe(error);
  });
});

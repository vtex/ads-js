import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductsByIds,
  getProductsBySkuIds,
} from "../../clients/search/search";
import type { Product, SearchResponse } from "../../clients/search/types";
import { intelligentSearchFetcher } from "./fetcher";

vi.mock("../../clients/search/search", () => ({
  getProductsByIds: vi.fn(),
  getProductsBySkuIds: vi.fn(),
  MAX_PRODUCTS_PER_SEARCH: 2,
}));

const mockedById = vi.mocked(getProductsByIds);
const mockedBySku = vi.mocked(getProductsBySkuIds);

const identity = {
  accountName: "acme",
  publisherId: "publisher-1",
  sessionId: "session-1",
};

const offer = (skuId: string, productId = "", sellerId = "1") => ({
  skuId,
  sellerId,
  productId,
});

// A product with one item per SKU, each sold by seller 1.
const product = (productId: string, skuIds: string[]) =>
  ({
    productId,
    items: skuIds.map((itemId) => ({
      itemId,
      sellers: [{ sellerId: "1" }],
    })),
  }) as unknown as Product;

const respond = (...products: Product[]) =>
  ({ products }) as unknown as SearchResponse;

const noSignal = { signal: undefined };

describe("intelligentSearchFetcher", () => {
  beforeEach(() => {
    mockedById.mockReset().mockResolvedValue(respond());
    mockedBySku.mockReset().mockResolvedValue(respond());
  });

  it("searches by product ID the offers that have one", async () => {
    await intelligentSearchFetcher(
      [offer("37", "p1"), offer("38", "p1")],
      identity,
    );

    expect(mockedById).toHaveBeenCalledWith("acme", ["p1"], noSignal);
    expect(mockedBySku).not.toHaveBeenCalled();
  });

  it("searches by SKU the offers without a product ID", async () => {
    await intelligentSearchFetcher(
      [offer("37"), offer("37", "", "2")],
      identity,
    );

    expect(mockedBySku).toHaveBeenCalledWith("acme", ["37"], noSignal);
    expect(mockedById).not.toHaveBeenCalled();
  });

  it("searches both ways at once for mixed offers", async () => {
    mockedById.mockResolvedValue(respond(product("p1", ["37"])));
    mockedBySku.mockResolvedValue(respond(product("p2", ["40"])));

    const products = await intelligentSearchFetcher(
      [offer("37", "p1"), offer("40")],
      identity,
    );

    expect(products.map((p) => p.productId)).toEqual(["p1", "p2"]);
  });

  it("makes no request without offers", async () => {
    expect(await intelligentSearchFetcher([], identity)).toEqual([]);
    expect(mockedById).not.toHaveBeenCalled();
    expect(mockedBySku).not.toHaveBeenCalled();
  });

  it("splits each search into batches of the search limit", async () => {
    await intelligentSearchFetcher(
      [
        offer("1", "p1"),
        offer("2", "p2"),
        offer("3", "p3"),
        offer("4"),
        offer("5"),
        offer("6"),
      ],
      identity,
    );

    expect(mockedById.mock.calls.map((call) => call[1])).toEqual([
      ["p1", "p2"],
      ["p3"],
    ]);
    expect(mockedBySku.mock.calls.map((call) => call[1])).toEqual([
      ["4", "5"],
      ["6"],
    ]);
  });

  it("returns a product found by more than one request once", async () => {
    mockedById.mockResolvedValue(respond(product("p1", ["1", "2"])));
    mockedBySku.mockResolvedValue(respond(product("p1", ["1", "2"])));

    const products = await intelligentSearchFetcher(
      [offer("1", "p1"), offer("2")],
      identity,
    );

    expect(products.map((p) => p.productId)).toEqual(["p1"]);
    expect(products[0].items.map((item) => item.itemId)).toEqual(["1", "2"]);
  });

  it("keeps only the offers' SKUs and sellers", async () => {
    mockedBySku.mockResolvedValue(
      respond(product("p1", ["37", "38"]), product("p2", ["40"])),
    );

    const products = await intelligentSearchFetcher(
      [offer("37"), offer("40", "", "2")],
      identity,
    );

    expect(products.map((p) => p.productId)).toEqual(["p1"]);
    expect(products[0].items.map((item) => item.itemId)).toEqual(["37"]);
  });

  it("passes the signal to every search request", async () => {
    const { signal } = new AbortController();

    await intelligentSearchFetcher(
      [offer("1", "p1"), offer("2", "p2"), offer("3", "p3"), offer("4")],
      identity,
      { signal },
    );

    const calls = [...mockedById.mock.calls, ...mockedBySku.mock.calls];
    expect(calls).toHaveLength(3);
    for (const call of calls) expect(call[2]).toEqual({ signal });
  });

  it("rejects when any request fails", async () => {
    const error = new Error("HTTP error! status: 500");
    mockedById.mockResolvedValue(respond(product("p1", ["1"])));
    mockedBySku.mockRejectedValue(error);

    await expect(
      intelligentSearchFetcher([offer("1", "p1"), offer("2")], identity),
    ).rejects.toBe(error);
  });
});

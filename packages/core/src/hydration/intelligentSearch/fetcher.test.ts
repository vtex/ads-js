import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductsByIds } from "../../clients/search/search";
import { intelligentSearchFetcher } from "./fetcher";

vi.mock("../../clients/search/search", () => ({
  getProductsByIds: vi.fn(),
}));

const mockedGetProductsByIds = vi.mocked(getProductsByIds);

const identity = {
  accountName: "acme",
  publisherId: "publisher-1",
  sessionId: "session-1",
};

const offers = [{ skuId: "sku1", sellerId: "1", productId: "p1" }];

describe("intelligentSearchFetcher", () => {
  beforeEach(() => {
    mockedGetProductsByIds.mockReset();
    mockedGetProductsByIds.mockResolvedValue({
      products: [],
    } as unknown as Awaited<ReturnType<typeof getProductsByIds>>);
  });

  it("requests the offers' products from the account", async () => {
    await intelligentSearchFetcher(offers, identity);

    expect(mockedGetProductsByIds).toHaveBeenCalledWith("acme", ["p1"], {
      signal: undefined,
    });
  });

  it("passes the signal to the search request", async () => {
    const { signal } = new AbortController();

    await intelligentSearchFetcher(offers, identity, { signal });

    expect(mockedGetProductsByIds).toHaveBeenCalledWith("acme", ["p1"], {
      signal,
    });
  });

  it("rejects when the search request is cancelled", async () => {
    const reason = new DOMException("Aborted", "AbortError");
    mockedGetProductsByIds.mockRejectedValue(reason);

    await expect(
      intelligentSearchFetcher(offers, identity, {
        signal: AbortSignal.abort(reason),
      }),
    ).rejects.toBe(reason);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductsByIds,
  getProductsBySkuIds,
  getSearchBaseUrl,
  productSearchUrl as productSearchPath,
} from "./search"; // adjust path
import { httpClient } from "../httpClient";
import { SearchResponse } from "./types";

vi.mock("../httpClient", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("getProductsByIds", () => {
  const mockedHttpClient = vi.mocked(httpClient, true);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls httpClient.get with correct URL and query parameters", async () => {
    const account = "acme";
    const productIds = ["product1", "product2"];

    const expectedResponse: Partial<SearchResponse> = {
      products: [
        {
          productId: "1",
          cacheId: "",
          description: "",
          productName: "",
          productReference: "",
          linkText: "",
          brand: "",
          brandId: 0,
          link: "",
          categories: [],
          categoryId: "",
          categoriesIds: [],
          priceRange: {
            sellingPrice: {
              highPrice: 0,
              lowPrice: 0,
            },
            listPrice: {
              highPrice: 0,
              lowPrice: 0,
            },
          },
          specificationGroups: [],
          skuSpecifications: [],
          productClusters: [],
          clusterHighlights: [],
          properties: [],
          items: [],
          releaseDate: 0,
          metaTagDescription: "",
          origin: "",
          productTitle: "",
          deliveryPromisesBadges: [],
        },
      ],
      recordsFiltered: 0,
      fuzzy: "",
      operator: "",
      translated: false,
    };

    mockedHttpClient.get.mockResolvedValue(expectedResponse);

    const result = await getProductsByIds(account, productIds);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl(account),
      `${productSearchPath}?q=product:product1;product2`,
      undefined,
    );

    expect(result).toEqual(expectedResponse);
  });

  it("throws if httpClient.get fails", async () => {
    mockedHttpClient.get.mockRejectedValue(new Error("Search failed"));

    await expect(getProductsByIds("acme", ["product1"])).rejects.toThrow(
      "Search failed",
    );
  });

  it("handles single product ID correctly", async () => {
    const account = "acme";
    const productIds = ["product123"];

    const expectedResponse: Partial<SearchResponse> = {
      products: [],
      recordsFiltered: 0,
      fuzzy: "",
      operator: "",
      translated: false,
    };

    mockedHttpClient.get.mockResolvedValue(expectedResponse);

    await getProductsByIds(account, productIds);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl(account),
      `${productSearchPath}?q=product:product123`,
      undefined,
    );
  });

  it("handles empty product IDs array", async () => {
    const account = "acme";
    const productIds: string[] = [];

    const expectedResponse: Partial<SearchResponse> = {
      products: [],
      recordsFiltered: 0,
      fuzzy: "",
      operator: "",
      translated: false,
    };

    mockedHttpClient.get.mockResolvedValue(expectedResponse);

    await getProductsByIds(account, productIds);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl(account),
      `${productSearchPath}?q=product:`,
      undefined,
    );
  });

  it("encodes each product ID, so one can't break the query", async () => {
    mockedHttpClient.get.mockResolvedValue({ products: [] });

    await getProductsByIds("acme", ["a;b", "c&d"]);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl("acme"),
      `${productSearchPath}?q=product:a%3Bb;c%26d`,
      undefined,
    );
  });

  it("passes the signal to httpClient.get", async () => {
    mockedHttpClient.get.mockResolvedValue({ products: [] });
    const { signal } = new AbortController();

    await getProductsByIds("acme", ["product1"], { signal });

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl("acme"),
      `${productSearchPath}?q=product:product1`,
      { signal },
    );
  });
});

describe("getProductsBySkuIds", () => {
  const mockedHttpClient = vi.mocked(httpClient, true);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedHttpClient.get.mockResolvedValue({ products: [] });
  });

  it("searches the SKUs in one request", async () => {
    await getProductsBySkuIds("acme", ["37", "21"]);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl("acme"),
      `${productSearchPath}?q=sku:37;21`,
      undefined,
    );
  });

  it("encodes each SKU, so one can't break the query", async () => {
    await getProductsBySkuIds("acme", ["a;b", "c&d"]);

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl("acme"),
      `${productSearchPath}?q=sku:a%3Bb;c%26d`,
      undefined,
    );
  });

  it("passes the signal to httpClient.get", async () => {
    const { signal } = new AbortController();

    await getProductsBySkuIds("acme", ["37"], { signal });

    expect(httpClient.get).toHaveBeenCalledWith(
      getSearchBaseUrl("acme"),
      `${productSearchPath}?q=sku:37`,
      { signal },
    );
  });
});

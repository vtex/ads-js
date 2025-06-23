import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductsByIds,
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
    );
  });
});

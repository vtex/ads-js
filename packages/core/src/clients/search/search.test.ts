import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductsBySkuId,
  getSearchBaseUrl,
  productSearchUrl as productSearchPath,
} from "./search"; // adjust path
import { httpClient } from "../httpClient";
import { SearchResponse } from "./types";

vi.mock("../httpClient", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("getProductsBySkuId", () => {
  const mockedHttpClient = vi.mocked(httpClient, true);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls httpClient.post with correct URL and body", async () => {
    const account = "acme";
    const skuIds = ["sku1", "sku2"];

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

    mockedHttpClient.post.mockResolvedValue(expectedResponse);

    const result = await getProductsBySkuId(account, skuIds);

    expect(httpClient.post).toHaveBeenCalledWith(
      getSearchBaseUrl(account),
      productSearchPath,
      { skuIds },
    );

    expect(result).toEqual(expectedResponse);
  });

  it("throws if httpClient.post fails", async () => {
    mockedHttpClient.post.mockRejectedValue(new Error("Search failed"));

    await expect(getProductsBySkuId("acme", ["sku1"])).rejects.toThrow(
      "Search failed",
    );
  });
});

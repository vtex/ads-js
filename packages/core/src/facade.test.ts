import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRawAds, getHydratedAds } from "./facade";
import { getAds } from "./clients/adServer";
import {
  getSponsoredProductArray,
  AdsByPlacement,
  getProductIds,
  getOffer,
} from "./clients/adServer/mappers";

import { Product } from "./clients/search/types";
import { SponsoredProductDetail } from "./clients/adServer/types";
import { GetAdsArgs, RawAdsResponse } from "./types";
import { fetchWithIS } from "./hydration/intelligentSearchFetcher/fetchWithIS";
import { searchProductMatchesOffer } from "./hydration/intelligentSearchFetcher/searchProductMatchesOffer";

// Mock all dependencies
vi.mock("./clients/adServer", () => ({
  getAds: vi.fn(),
}));

vi.mock("./clients/adServer/mappers", () => ({
  getSponsoredProductArray: vi.fn(),
  getProductIds: vi.fn(),
  getOffer: vi.fn(),
}));

vi.mock("./utils/toAdServerArgs", () => ({
  toAdServerArgs: vi.fn((args) => args),
}));

vi.mock("./hydration/intelligentSearchFetcher/fetchWithIS", () => ({
  fetchWithIS: vi.fn(),
}));

vi.mock("./hydration/intelligentSearchFetcher/searchProductMatchesOffer", () => ({
  searchProductMatchesOffer: vi.fn(),
}));

describe("facade", () => {
  // Mock instances
  const mockedGetAds = vi.mocked(getAds);
  const mockedGetSponsoredProductArray = vi.mocked(getSponsoredProductArray);
  const mockedGetSkuIds = vi.mocked(getProductIds);
  const mockedGetOffer = vi.mocked(getOffer);
  const mockedFetchWithIS = vi.mocked(fetchWithIS);
  const mockedSearchProductMatchesOffer = vi.mocked(searchProductMatchesOffer);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test data
  const mockGetAdsArgs: GetAdsArgs = {
    identity: {
      accountName: "testaccount",
      publisherId: "test-publisher",
      userId: "user-123",
      sessionId: "session-456",
      channel: "site",
    },
    placements: {
      search_top_product: { quantity: 1, types: ["product"] },
      home_shelf_product: { quantity: 1, types: ["product"] },
    },
    search: {
      selectedFacets: [{ key: "brand", value: "Nike" }],
      term: "shoes",
    },
  };

  const mockSponsoredProduct: SponsoredProductDetail = {
    ad_id: "ad-123",
    product_sku: "sku-123",
    click_url: "https://example.com/click",
    impression_url: "aW1wcmVzc2lvbl9kYXRh", // base64 encoded data
    view_url: "https://example.com/view",
    product_name: "Test Product",
    seller_id: "seller-456",
  };

  const mockAdsByPlacement: AdsByPlacement[] = [
    ["search_top_product", [mockSponsoredProduct]],
    [
      "home_shelf_product",
      [
        {
          ...mockSponsoredProduct,
          ad_id: "ad-456",
          product_sku: "sku-456",
          product_name: "Another Test Product",
        },
      ],
    ],
  ];

  const mockProduct: Product = {
    cacheId: "cache-123",
    productId: "product-123",
    description: "Test product description",
    productName: "Test Product",
    productReference: "ref-123",
    linkText: "test-product",
    brand: "TestBrand",
    brandId: 1,
    link: "/test-product",
    categories: ["Category1"],
    categoryId: "cat-1",
    categoriesIds: ["cat-1"],
    priceRange: {
      sellingPrice: { highPrice: 100, lowPrice: 80 },
      listPrice: { highPrice: 120, lowPrice: 100 },
    },
    specificationGroups: [],
    skuSpecifications: [],
    productClusters: [],
    clusterHighlights: [],
    properties: [],
    items: [
      {
        itemId: "sku-123",
        name: "Test Product",
        nameComplete: "Test Product Complete",
        complementName: "",
        referenceId: [],
        measurementUnit: "un",
        unitMultiplier: 1,
        variations: [],
        ean: "",
        modalType: "",
        videos: [],
        attachments: [],
        isKit: false,
        attributes: [],
        sellers: [],
        images: [],
      },
    ],
    releaseDate: Date.now(),
    metaTagDescription: "Test meta description",
    origin: "test",
    productTitle: "Test Product Title",
    deliveryPromisesBadges: [],
  };

  describe("getRawAds", () => {
    it("should fetch and return raw ads grouped by placement", async () => {
      // Arrange
      const mockAdServerResponse = {};
      mockedGetAds.mockResolvedValue(mockAdServerResponse);
      mockedGetSponsoredProductArray.mockReturnValue(mockAdsByPlacement);

      const expectedResponse: RawAdsResponse = {
        sponsoredProducts: {
          search_top_product: [mockSponsoredProduct],
          home_shelf_product: [
            {
              ...mockSponsoredProduct,
              ad_id: "ad-456",
              product_sku: "sku-456",
              product_name: "Another Test Product",
            },
          ],
        },
        banners: undefined,
        sponsoredBrands: undefined,
      };

      // Act
      const result = await getRawAds(mockGetAdsArgs);

      // Assert
      expect(mockedGetAds).toHaveBeenCalledWith(
        mockGetAdsArgs.identity.publisherId,
        mockGetAdsArgs,
      );
      expect(mockedGetSponsoredProductArray).toHaveBeenCalledWith(
        mockAdServerResponse,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should return empty sponsoredProducts when no ads are returned", async () => {
      // Arrange
      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue([]);

      const expectedResponse: RawAdsResponse = {
        sponsoredProducts: {},
        banners: undefined,
        sponsoredBrands: undefined,
      };

      // Act
      const result = await getRawAds(mockGetAdsArgs);

      // Assert
      expect(result).toEqual(expectedResponse);
    });

    it("should handle multiple ads for the same placement", async () => {
      // Arrange
      const multipleAdsForSamePlacement: AdsByPlacement[] = [
        [
          "search_top_product",
          [
            mockSponsoredProduct,
            {
              ...mockSponsoredProduct,
              ad_id: "ad-789",
              product_sku: "sku-789",
            },
          ],
        ],
      ];

      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue(
        multipleAdsForSamePlacement,
      );

      // Act
      const result = await getRawAds(mockGetAdsArgs);

      // Assert
      expect(result.sponsoredProducts.search_top_product).toHaveLength(2);
      expect(result.sponsoredProducts.search_top_product[0]).toEqual(
        mockSponsoredProduct,
      );
      expect(result.sponsoredProducts.search_top_product[1]).toEqual({
        ...mockSponsoredProduct,
        ad_id: "ad-789",
        product_sku: "sku-789",
      });
    });
  });

  describe("getHydratedAds", () => {
    it("should fetch ads, enrich with product data, and return hydrated ads", async () => {
      // Arrange
      const mockAdServerResponse = {};
      const mockProducts = [mockProduct];

      mockedGetAds.mockResolvedValue(mockAdServerResponse);
      mockedGetSponsoredProductArray.mockReturnValue(mockAdsByPlacement);
      mockedGetOffer.mockReturnValue({
        skuId: mockSponsoredProduct.product_sku,
        sellerId: mockSponsoredProduct.seller_id ?? "1",
      });
      mockedFetchWithIS.mockResolvedValue(mockProducts);
      mockedSearchProductMatchesOffer.mockReturnValue(true);

      // Act
      const result = await getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer);

      // Assert
      expect(mockedGetAds).toHaveBeenCalledWith(
        mockGetAdsArgs.identity.publisherId,
        mockGetAdsArgs,
      );
      expect(mockedGetSponsoredProductArray).toHaveBeenCalledWith(
        mockAdServerResponse,
      );
      expect(mockedFetchWithIS).toHaveBeenCalledWith(
        mockAdsByPlacement,
        mockGetAdsArgs.identity,
      );

      expect(result.sponsoredProducts.byPlacement.search_top_product).toHaveLength(1);
      expect(result.sponsoredProducts.byPlacement.search_top_product[0]).toEqual({
        product: mockProduct,
        advertisement: {
          eventUrls: {
            click: mockSponsoredProduct.click_url,
            impression: mockSponsoredProduct.impression_url,
            view: mockSponsoredProduct.view_url,
          },
          eventParameters: "YVcxd2NtVnpjMmx2Ymw5a1lYUmg=",
          sponsoredBySellerId: mockSponsoredProduct.seller_id,
        },
      });
    });

    it("should filter products to only include those with matching SKUs", async () => {
      // Arrange
      const nonMatchingProduct: Product = {
        ...mockProduct,
        items: [
          {
            ...mockProduct.items[0],
            itemId: "non-matching-sku",
          },
        ],
      };

      const mockProducts = [mockProduct, nonMatchingProduct];

      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue(mockAdsByPlacement);
      mockedGetOffer.mockReturnValue({
        skuId: mockSponsoredProduct.product_sku,
        sellerId: mockSponsoredProduct.seller_id ?? "1",
      });
      mockedFetchWithIS.mockResolvedValue(mockProducts);
      mockedSearchProductMatchesOffer
        .mockImplementation((product, offer) => 
          product.items.some(item => item.itemId === offer.skuId)
        );

      // Act
      const result = await getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer);

      // Assert
      expect(result.sponsoredProducts.byPlacement.search_top_product).toHaveLength(1);
      expect(
        result.sponsoredProducts.byPlacement.search_top_product[0].product.items[0].itemId,
      ).toBe("sku-123");
    });

    it("should handle empty ads response", async () => {
      // Arrange
      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue([]);
      mockedFetchWithIS.mockResolvedValue([]);

      // Act
      const result = await getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer);

      // Assert
      expect(result).toEqual({
        sponsoredProducts: {
          byPlacement: {},
          failed: [],
        },
        banners: undefined,
        sponsoredBrands: undefined,
      });
    });

    it("should handle products with multiple items and match correct SKU", async () => {
      // Arrange
      const productWithMultipleItems: Product = {
        ...mockProduct,
        items: [
          {
            ...mockProduct.items[0],
            itemId: "sku-111",
          },
          {
            ...mockProduct.items[0],
            itemId: "sku-123", // This should match
          },
          {
            ...mockProduct.items[0],
            itemId: "sku-333",
          },
        ],
      };

      const mockProducts = [productWithMultipleItems];

      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue(mockAdsByPlacement);
      mockedGetOffer.mockReturnValue({
        skuId: mockSponsoredProduct.product_sku,
        sellerId: mockSponsoredProduct.seller_id ?? "1",
      });
      mockedFetchWithIS.mockResolvedValue(mockProducts);
      mockedSearchProductMatchesOffer.mockReturnValue(true);

      // Act
      const result = await getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer);

      // Assert
      expect(result.sponsoredProducts.byPlacement.search_top_product).toHaveLength(1);
      expect(result.sponsoredProducts.byPlacement.search_top_product[0]).toEqual({
        product: productWithMultipleItems,
        advertisement: {
          eventUrls: {
            click: mockSponsoredProduct.click_url,
            impression: mockSponsoredProduct.impression_url,
            view: mockSponsoredProduct.view_url,
          },
          eventParameters: "YVcxd2NtVnpjMmx2Ymw5a1lYUmg=",
          sponsoredBySellerId: mockSponsoredProduct.seller_id,
        },
      });
    });
  });

  describe("error handling", () => {
    it("should propagate errors from getAds in getRawAds", async () => {
      // Arrange
      const error = new Error("Ad server error");
      mockedGetAds.mockRejectedValue(error);

      // Act & Assert
      await expect(getRawAds(mockGetAdsArgs)).rejects.toThrow(
        "Ad server error",
      );
    });

    it("should propagate errors from getAds in getHydratedAds", async () => {
      // Arrange
      const error = new Error("Ad server error");
      mockedGetAds.mockRejectedValue(error);

      // Act & Assert
      await expect(getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer)).rejects.toThrow(
        "Ad server error",
      );
    });

    it("should propagate errors from getProductsBySkuId in getHydratedAds", async () => {
      // Arrange
      const error = new Error("Search service error");
      mockedGetAds.mockResolvedValue({});
      mockedGetSponsoredProductArray.mockReturnValue(mockAdsByPlacement);
      mockedFetchWithIS.mockRejectedValue(error);

      // Act & Assert
      await expect(getHydratedAds(mockGetAdsArgs, fetchWithIS, searchProductMatchesOffer)).rejects.toThrow(
        "Search service error",
      );
    });
  });
});

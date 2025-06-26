import {
  getSponsoredProductArray,
  getProductIds,
  AdsByPlacement,
} from "./mappers";
import {
  AdResponse,
  SponsoredBrandDetail,
  SponsoredProductDetail,
} from "./types";
import { Offer } from "../../hydration/types";
import { expect, it, describe } from "vitest";

describe.concurrent("getSponsoredProductArray", () => {
  const sampleSponsoredProduct: SponsoredProductDetail = {
    ad_id: "ad1",
    click_url: "http://example.com/click",
    impression_url: "http://example.com/impression",
    view_url: "http://example.com/view",
    product_name: "Product 1",
    product_sku: "sku1",
    image_url: "http://example.com/image1.jpg",
    seller_id: "seller1",
    destination_url: "http://example.com/destination1",
    product_metadata: {
      productId: "product1",
    },
  };

  const sampleSponsoredBrand: SponsoredBrandDetail = {
    ad_id: "ad2",
    click_url: "http://example.com/click2",
    impression_url: "http://example.com/impression2",
    view_url: "http://example.com/view2",
    destination_url: "http://example.com/destination2",
    products: [
      {
        ...sampleSponsoredProduct,
        product_sku: "sku2",
        product_metadata: {
          productId: "product2",
        },
      },
    ],
    brand_url: "http://example.com/brand",
    brand_name: "Brand 1",
    headline: "Brand Headline",
    description: "Brand Description",
  };

  it("should return an empty array when given an empty ad response", () => {
    const adResponse: AdResponse = {};
    const result = getSponsoredProductArray(adResponse);
    expect(result).toEqual([]);
  });

  it("should return an empty array when no sponsored products are present", () => {
    const adResponse: AdResponse = {
      placement1: [{ ...sampleSponsoredBrand }],
      placement2: [{ ...sampleSponsoredBrand }],
    };
    const result = getSponsoredProductArray(adResponse);
    expect(result).toEqual([]);
  });

  it("should return sponsored products grouped by placement", () => {
    const adResponse: AdResponse = {
      placement1: [
        {
          ...sampleSponsoredProduct,
          product_sku: "sku1",
          product_metadata: { productId: "product1" },
        },
      ],
      placement2: [
        {
          ...sampleSponsoredProduct,
          product_sku: "sku2",
          product_metadata: { productId: "product2" },
        },
        {
          ...sampleSponsoredProduct,
          product_sku: "sku3",
          product_metadata: { productId: "product3" },
        },
      ],
    };

    const expected: AdsByPlacement[] = [
      [
        "placement1",
        [
          {
            ...sampleSponsoredProduct,
            product_sku: "sku1",
            product_metadata: { productId: "product1" },
          },
        ],
      ],
      [
        "placement2",
        [
          {
            ...sampleSponsoredProduct,
            product_sku: "sku2",
            product_metadata: { productId: "product2" },
          },
          {
            ...sampleSponsoredProduct,
            product_sku: "sku3",
            product_metadata: { productId: "product3" },
          },
        ],
      ],
    ];

    const result = getSponsoredProductArray(adResponse);
    expect(result).toEqual(expected);
  });

  it("should ignore placements with no sponsored products", () => {
    const adResponse: AdResponse = {
      placement1: [{ ...sampleSponsoredBrand }],
      placement2: [
        {
          ...sampleSponsoredProduct,
          product_sku: "sku2",
          product_metadata: { productId: "product2" },
        },
        {
          ...sampleSponsoredProduct,
          product_sku: "sku3",
          product_metadata: { productId: "product3" },
        },
      ],
    };

    const expected: AdsByPlacement[] = [
      [
        "placement2",
        [
          {
            ...sampleSponsoredProduct,
            product_sku: "sku2",
            product_metadata: { productId: "product2" },
          },
          {
            ...sampleSponsoredProduct,
            product_sku: "sku3",
            product_metadata: { productId: "product3" },
          },
        ],
      ],
    ];

    const result = getSponsoredProductArray(adResponse);
    expect(result).toEqual(expected);
  });
});

describe.concurrent("getProductIds", () => {
  it("should return an empty array when given an empty offers array", () => {
    const offers: Offer[] = [];
    const result = getProductIds(offers);
    expect(result).toEqual([]);
  });

  it("should extract product ID from a single offer", () => {
    const offers: Offer[] = [
      {
        productId: "product123",
        skuId: "sku123",
        sellerId: "seller1",
      },
    ];
    const result = getProductIds(offers);
    expect(result).toEqual(["product123"]);
  });

  it("should extract product IDs from multiple offers", () => {
    const offers: Offer[] = [
      {
        productId: "product123",
        skuId: "sku123",
        sellerId: "seller1",
      },
      {
        productId: "product456",
        skuId: "sku456",
        sellerId: "seller2",
      },
      {
        productId: "product789",
        skuId: "sku789",
        sellerId: "seller3",
      },
    ];
    const result = getProductIds(offers);
    expect(result).toEqual(["product123", "product456", "product789"]);
  });

  it("should handle duplicate product IDs", () => {
    const offers: Offer[] = [
      {
        productId: "product123",
        skuId: "sku123",
        sellerId: "seller1",
      },
      {
        productId: "product123",
        skuId: "sku456",
        sellerId: "seller2",
      },
      {
        productId: "product789",
        skuId: "sku789",
        sellerId: "seller3",
      },
    ];
    const result = getProductIds(offers);
    expect(result).toEqual(["product123", "product123", "product789"]);
  });

  it("should handle empty product IDs", () => {
    const offers: Offer[] = [
      {
        productId: "",
        skuId: "sku123",
        sellerId: "seller1",
      },
      {
        productId: "product456",
        skuId: "sku456",
        sellerId: "seller2",
      },
    ];
    const result = getProductIds(offers);
    expect(result).toEqual(["", "product456"]);
  });
});

import { getSponsoredProductArray, getProductIds, AdsByPlacement } from "./mappers";
import {
  AdResponse,
  SponsoredBrandDetail,
  SponsoredProductDetail,
} from "./types";
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
      placement1: [{ ...sampleSponsoredProduct, product_sku: "sku1" }],
      placement2: [
        { ...sampleSponsoredProduct, product_sku: "sku2" },
        { ...sampleSponsoredProduct, product_sku: "sku3" },
      ],
    };

    const expected: AdsByPlacement[] = [
      ["placement1", [{ ...sampleSponsoredProduct, product_sku: "sku1" }]],
      [
        "placement2",
        [
          { ...sampleSponsoredProduct, product_sku: "sku2" },
          { ...sampleSponsoredProduct, product_sku: "sku3" },
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
        { ...sampleSponsoredProduct, product_sku: "sku2" },
        { ...sampleSponsoredProduct, product_sku: "sku3" },
      ],
    };

    const expected: AdsByPlacement[] = [
      [
        "placement2",
        [
          { ...sampleSponsoredProduct, product_sku: "sku2" },
          { ...sampleSponsoredProduct, product_sku: "sku3" },
        ],
      ],
    ];

    const result = getSponsoredProductArray(adResponse);
    expect(result).toEqual(expected);
  });
});

describe.concurrent("getProductIds", () => {
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

  it("should return an empty array when given an empty ads array", () => {
    const ads: AdsByPlacement[] = [];
    const result = getProductIds(ads);
    expect(result).toEqual([]);
  });

  it("should return an empty array when placements have no products", () => {
    const ads: AdsByPlacement[] = [
      ["placement1", []],
      ["placement2", []],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual([]);
  });

  it("should return an empty array when products have no product metadata", () => {
    const productWithoutMetadata: SponsoredProductDetail = {
      ...sampleSponsoredProduct,
      product_metadata: undefined,
    };
    const ads: AdsByPlacement[] = [
      ["placement1", [productWithoutMetadata]],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual([]);
  });

  it("should extract product ID from a single placement with one product", () => {
    const ads: AdsByPlacement[] = [
      ["placement1", [{ ...sampleSponsoredProduct, product_metadata: { productId: "product123" } }]],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual(["product123"]);
  });

  it("should extract product IDs from a single placement with multiple products", () => {
    const ads: AdsByPlacement[] = [
      [
        "placement1",
        [
          { ...sampleSponsoredProduct, product_metadata: { productId: "product123" } },
          { ...sampleSponsoredProduct, product_metadata: { productId: "product456" } },
          { ...sampleSponsoredProduct, product_metadata: { productId: "product789" } },
        ],
      ],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual(["product123", "product456", "product789"]);
  });

  it("should extract product IDs from multiple placements", () => {
    const ads: AdsByPlacement[] = [
      [
        "placement1",
        [
          { ...sampleSponsoredProduct, product_metadata: { productId: "product123" } },
          { ...sampleSponsoredProduct, product_metadata: { productId: "product456" } },
        ],
      ],
      ["placement2", [{ ...sampleSponsoredProduct, product_metadata: { productId: "product789" } }]],
      [
        "placement3",
        [
          { ...sampleSponsoredProduct, product_metadata: { productId: "product101" } },
          { ...sampleSponsoredProduct, product_metadata: { productId: "product202" } },
        ],
      ],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual(["product123", "product456", "product789", "product101", "product202"]);
  });

  it("should filter out products with undefined product IDs", () => {
    const ads: AdsByPlacement[] = [
      [
        "placement1",
        [
          { ...sampleSponsoredProduct, product_metadata: { productId: "product123" } },
          { ...sampleSponsoredProduct, product_metadata: { productId: undefined } },
          { ...sampleSponsoredProduct, product_metadata: { productId: "product456" } },
        ],
      ],
    ];
    const result = getProductIds(ads);
    expect(result).toEqual(["product123", "product456"]);
  });
});

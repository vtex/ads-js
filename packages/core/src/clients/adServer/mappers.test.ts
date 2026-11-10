import {
  getSponsoredProductArray,
  getStoryArray,
  AdsByPlacement,
} from "./mappers";
import {
  AdResponse,
  SponsoredBrandDetail,
  SponsoredProductDetail,
  StoryAdDetail,
} from "./types";
import { mockStory } from "./story.mock";
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

const linkStory: StoryAdDetail = {
  ...mockStory,
  ad_id: "story2",
  position: 1,
  destination_url: "https://advertiser.example.com/promo",
  product: null,
  call_to_action: "Saiba mais",
};

const sampleProductAd: SponsoredProductDetail = {
  ad_id: "ad1",
  click_url: "http://example.com/click",
  impression_url: "http://example.com/impression",
  view_url: "http://example.com/view",
  product_name: "Product 1",
  product_sku: "sku1",
  product_metadata: { productId: "product1" },
};

describe.concurrent("getStoryArray", () => {
  it("should return an empty array when given an empty ad response", () => {
    expect(getStoryArray({})).toEqual([]);
  });

  it("should return Stories grouped by placement, keeping link Stories", () => {
    const adResponse: AdResponse = {
      home_stories: [mockStory, linkStory],
    };

    expect(getStoryArray(adResponse)).toEqual([
      ["home_stories", [mockStory, linkStory]],
    ]);
  });

  it("should drop other ad types and placements without Stories", () => {
    const adResponse: AdResponse = {
      home_stories: [mockStory, sampleProductAd],
      search_top_product: [sampleProductAd],
    };

    expect(getStoryArray(adResponse)).toEqual([["home_stories", [mockStory]]]);
  });

  it("should ignore envelope fields that are not ad arrays", () => {
    const adResponse = {
      home_stories: [mockStory],
      request_id: "request",
      query_id: "query",
      query_at: "2026-11-04T00:00:00Z",
    } as unknown as AdResponse;

    expect(getStoryArray(adResponse)).toEqual([["home_stories", [mockStory]]]);
  });
});

describe.concurrent("getSponsoredProductArray with Stories", () => {
  it("should not treat Stories as sponsored products", () => {
    const adResponse: AdResponse = {
      home_stories: [mockStory, linkStory],
      search_top_product: [sampleProductAd],
    };

    expect(getSponsoredProductArray(adResponse)).toEqual([
      ["search_top_product", [sampleProductAd]],
    ]);
  });
});

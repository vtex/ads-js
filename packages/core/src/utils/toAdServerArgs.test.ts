import { describe, it, expect } from "vitest";
import { toAdServerArgs } from "./toAdServerArgs";
import { GetAdsArgs } from "../types";

const baseArgs: GetAdsArgs = {
  identity: {
    accountName: "mercury",
    publisherId: "pub-123",
    sessionId: "sess-abc",
  },
  search: {},
  placements: {
    top_search: { quantity: 3, types: ["product"] },
  },
};

describe("toAdServerArgs — seller page term fallback", () => {
  it("uses sellerName facet as term when search.term is undefined", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: undefined,
        selectedFacets: [{ key: "sellerName", value: "ofertec" }],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBe("ofertec");
    expect(result.context).toBe("search");
  });

  it("uses seller facet as term when search.term is undefined", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: undefined,
        selectedFacets: [{ key: "seller", value: "shpseller382" }],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBe("shpseller382");
    expect(result.context).toBe("search");
  });

  it("prefers search.term over seller facet", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: "laptop",
        selectedFacets: [{ key: "sellerName", value: "ofertec" }],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBe("laptop");
    expect(result.context).toBe("search");
  });

  it("passes undefined term when neither search.term nor seller facet is present", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: undefined,
        selectedFacets: [{ key: "category-1", value: "eletronicos" }],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBeUndefined();
    expect(result.context).toBe("category");
  });

  it("does not use seller facet as term when category is also present", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: undefined,
        selectedFacets: [
          { key: "category-1", value: "eletronicos" },
          { key: "seller", value: "ofertec" },
        ],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBeUndefined();
    expect(result.context).toBe("category");
  });

  it("does not use seller facet as term when brand is also present", () => {
    const args: GetAdsArgs = {
      ...baseArgs,
      search: {
        term: undefined,
        selectedFacets: [
          { key: "brand", value: "nike" },
          { key: "seller", value: "ofertec" },
        ],
      },
    };

    const result = toAdServerArgs(args);

    expect(result.term).toBeUndefined();
    expect(result.context).toBe("brand_page");
  });
});

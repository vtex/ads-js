import { Facet } from "../../types";
import {
  getAttributeFromFacets,
  getCategoryFromFacets,
  getBrandFromFacets,
  getTagsFromFacets,
} from "./facetsAdapter";
import { describe, it, expect } from "vitest";

describe("getAttributeFromFacets", () => {
  it("returns undefined when selectedFacets is undefined", () => {
    const result = getAttributeFromFacets({
      selectedFacets: undefined,
      attributeSynonyms: ["c"],
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when selectedFacets is empty", () => {
    const result = getAttributeFromFacets({
      selectedFacets: [],
      attributeSynonyms: ["c"],
    });

    expect(result).toBeUndefined();
  });

  it("matches facet by exact synonym (case-insensitive)", () => {
    const facets: Facet[] = [{ key: "C", value: "Electronics" }];
    const result = getAttributeFromFacets({
      selectedFacets: facets,
      attributeSynonyms: ["c"],
    });

    expect(result).toEqual([{ key: "C", value: "Electronics" }]);
  });

  it("matches facet by prefix (case-insensitive)", () => {
    const facets: Facet[] = [{ key: "category-1", value: "Electronics" }];
    const result = getAttributeFromFacets({
      selectedFacets: facets,
      attributePrefix: "category",
    });

    expect(result).toEqual([{ key: "category-1", value: "Electronics" }]);
  });

  it("returns undefined if no facet matches", () => {
    const facets: Facet[] = [{ key: "foo", value: "bar" }];
    const result = getAttributeFromFacets({
      selectedFacets: facets,
      attributeSynonyms: ["brand"],
    });

    expect(result).toBeUndefined();
  });
});

describe("getCategoryFromFacets", () => {
  it("returns joined category string when matched", () => {
    const facets: Facet[] = [
      { key: "category-1", value: "Electronics" },
      { key: "category-2", value: "Laptops" },
    ];
    const result = getCategoryFromFacets(facets);
    expect(result).toBe("Electronics > Laptops");
  });

  it("returns joined category string using attribute synonyms", () => {
    const facets1: Facet[] = [{ key: "c", value: "Electronics" }];
    const facets2: Facet[] = [{ key: "categoria", value: "Electronics" }];
    const result1 = getCategoryFromFacets(facets1);
    const result2 = getCategoryFromFacets(facets2);
    expect(result1).toBe("Electronics");
    expect(result2).toBe("Electronics");
  });

  it("returns undefined when no category-related facets exist", () => {
    const facets: Facet[] = [{ key: "b", value: "Acme" }];
    const result = getCategoryFromFacets(facets);
    expect(result).toBeUndefined();
  });
});

describe("getBrandFromFacets", () => {
  it("returns array of brand values when matched", () => {
    const facets: Facet[] = [
      { key: "brand", value: "Acme" },
      { key: "BRAND", value: "Dunder Mifflin" },
      { key: "b", value: "Umbrella Corporation" },
    ];
    const result = [
      getBrandFromFacets(facets),
      getBrandFromFacets([facets[1]]),
      getBrandFromFacets([facets[2]]),
    ];
    expect(result).toEqual(["Acme", "Dunder Mifflin", "Umbrella Corporation"]);
  });

  it("returns undefined if no brand-related facet exists", () => {
    const facets: Facet[] = [{ key: "c", value: "Electronics" }];
    const result = getBrandFromFacets(facets);
    expect(result).toBeUndefined();
  });
});

describe("getTagsFromFacets", () => {
  it("returns formatted cluster tags when matched", () => {
    const facets: Facet[] = [
      { key: "productClusterIds", value: "123" },
      { key: "PRODUCTCLUSTERIDS", value: "456" },
    ];
    const result = getTagsFromFacets(facets);
    expect(result).toEqual(["product_cluster/123", "product_cluster/456"]);
  });

  it("returns undefined if no productClusterIds found", () => {
    const facets: Facet[] = [{ key: "brand", value: "Acme" }];
    const result = getTagsFromFacets(facets);
    expect(result).toBeUndefined();
  });
});

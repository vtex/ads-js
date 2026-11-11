import { describe, it, expect } from "vitest";
import { offersOf, productFinder } from "./mappers";
import type { Offer } from "./types";

const offer = (skuId: string): Offer => ({
  skuId,
  sellerId: "1",
  productId: "",
});

describe("offersOf", () => {
  it("collects the offers of every placement, in order", () => {
    const ads = { top: ["a", "b"], bottom: ["c"] };

    expect(offersOf(ads, offer)).toEqual([offer("a"), offer("b"), offer("c")]);
  });

  it("skips the ads without an offer", () => {
    const ads = { top: ["a", "link", "b"] };

    expect(
      offersOf(ads, (ad) => (ad === "link" ? undefined : offer(ad))),
    ).toEqual([offer("a"), offer("b")]);
  });
});

describe("productFinder", () => {
  const findProduct = productFinder(
    [{ sku: "a" }, { sku: "b" }],
    (product, { skuId }) => product.sku === skuId,
  );

  it("finds the offer's product", () => {
    expect(findProduct(offer("b"))).toEqual({ sku: "b" });
  });

  it("finds nothing without a match or without an offer", () => {
    expect(findProduct(offer("c"))).toBeUndefined();
    expect(findProduct(undefined)).toBeUndefined();
  });
});

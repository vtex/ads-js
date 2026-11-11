import { describe, it, expect } from "vitest";
import type { Product } from "../../clients/search/types";
import { intelligentSearchAvailability } from "./availability";

// A product with the given SKUs, each sold by the given sellers with their
// AvailableQuantity.
const product = (items: Record<string, [string, unknown][]>) =>
  ({
    productId: "p1",
    items: Object.entries(items).map(([itemId, sellers]) => ({
      itemId,
      sellers: sellers.map(([sellerId, AvailableQuantity]) => ({
        sellerId,
        commertialOffer: { Price: 10, AvailableQuantity },
      })),
    })),
  }) as unknown as Product;

const offer = (skuId: string, sellerId = "1") => ({
  skuId,
  sellerId,
  productId: "p1",
});

describe("intelligentSearchAvailability", () => {
  it("is available with a quantity above 0", () => {
    expect(
      intelligentSearchAvailability(
        product({ "21": [["1", 10]] }),
        offer("21"),
      ),
    ).toBe(true);
  });

  it("is unavailable with a quantity of 0", () => {
    expect(
      intelligentSearchAvailability(product({ "21": [["1", 0]] }), offer("21")),
    ).toBe(false);
  });

  it("reads the offer's SKU and seller, not the first ones", () => {
    const many = product({
      "20": [["1", 10]],
      "21": [
        ["1", 10],
        ["2", 0],
      ],
    });

    expect(intelligentSearchAvailability(many, offer("21", "2"))).toBe(false);
  });

  it("doesn't say for a SKU or seller the product doesn't have", () => {
    const one = product({ "21": [["1", 10]] });

    expect(intelligentSearchAvailability(one, offer("22"))).toBeUndefined();
    expect(
      intelligentSearchAvailability(one, offer("21", "2")),
    ).toBeUndefined();
  });

  it("doesn't say when the quantity isn't a number", () => {
    for (const quantity of [undefined, null, Number.NaN, "10"]) {
      const item = product({ "21": [["1", quantity]] });
      expect(intelligentSearchAvailability(item, offer("21"))).toBeUndefined();
    }
  });
});

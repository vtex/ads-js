import { describe, it, expect } from "vitest";
import type { Product } from "../../clients/search/types";
import { intelligentSearchPrice } from "./price";

interface Sold {
  sellerId: string;
  Price?: unknown;
  ListPrice?: unknown;
}

// A product with the given SKUs, each sold by the given sellers.
const product = (items: Record<string, Sold[]>) =>
  ({
    productId: "p1",
    items: Object.entries(items).map(([itemId, sellers]) => ({
      itemId,
      sellers: sellers.map(({ sellerId, Price, ListPrice }) => ({
        sellerId,
        commertialOffer: { Price, ListPrice },
      })),
    })),
  }) as unknown as Product;

const offer = (skuId: string, sellerId = "1") => ({
  skuId,
  sellerId,
  productId: "p1",
});

describe("intelligentSearchPrice", () => {
  it("reads the price, with the list price when it is higher", () => {
    const sale = product({
      "21": [{ sellerId: "1", Price: 450.23, ListPrice: 1000.99 }],
    });

    expect(intelligentSearchPrice(sale, offer("21"))).toEqual({
      price: 450.23,
      listPrice: 1000.99,
    });
  });

  it("leaves the list price out when it isn't above the price", () => {
    const regular = product({
      "21": [{ sellerId: "1", Price: 100, ListPrice: 100 }],
    });
    const lower = product({
      "21": [{ sellerId: "1", Price: 100, ListPrice: 80 }],
    });
    const missing = product({ "21": [{ sellerId: "1", Price: 100 }] });

    expect(intelligentSearchPrice(regular, offer("21"))).toEqual({
      price: 100,
    });
    expect(intelligentSearchPrice(lower, offer("21"))).toEqual({ price: 100 });
    expect(intelligentSearchPrice(missing, offer("21"))).toEqual({
      price: 100,
    });
  });

  it("reads the offer's SKU and seller, not the first ones", () => {
    const many = product({
      "20": [{ sellerId: "1", Price: 10 }],
      "21": [
        { sellerId: "1", Price: 20 },
        { sellerId: "2", Price: 30, ListPrice: 40 },
      ],
    });

    expect(intelligentSearchPrice(many, offer("21", "2"))).toEqual({
      price: 30,
      listPrice: 40,
    });
  });

  it("has no price for a SKU or seller the product doesn't have", () => {
    const one = product({ "21": [{ sellerId: "1", Price: 20 }] });

    expect(intelligentSearchPrice(one, offer("22"))).toBeUndefined();
    expect(intelligentSearchPrice(one, offer("21", "2"))).toBeUndefined();
  });

  it("returns a price of 0 as IS sends it", () => {
    const zero = product({ "21": [{ sellerId: "1", Price: 0, ListPrice: 0 }] });

    expect(intelligentSearchPrice(zero, offer("21"))).toEqual({ price: 0 });
  });

  it("has no price when the price isn't a number", () => {
    for (const Price of [undefined, null, Number.NaN, "129.9"]) {
      const item = product({
        "21": [{ sellerId: "1", Price, ListPrice: 200 }],
      });
      expect(intelligentSearchPrice(item, offer("21"))).toBeUndefined();
    }
  });
});

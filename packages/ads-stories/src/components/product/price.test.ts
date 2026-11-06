import { describe, it, expect } from "vitest";
import { priceFormatter, readProductPrice } from "./price";

// Intl separates the symbol with a no-break space.
const normalize = (text: string) => text.replace(/\s/g, " ");

describe("readProductPrice", () => {
  it("reads the regular price", () => {
    expect(readProductPrice({ price: 89.9 })).toEqual({ price: 89.9 });
  });

  it("reads a sale: the promotional price, from the regular one", () => {
    expect(
      readProductPrice({ price: 159.9, promotional_price: 129.9 }),
    ).toEqual({ price: 129.9, listPrice: 159.9 });
  });

  it("ignores a promotional price of 0 or not below the regular one", () => {
    expect(readProductPrice({ price: 50, promotional_price: 0 })).toEqual({
      price: 50,
    });
    expect(readProductPrice({ price: 50, promotional_price: 60 })).toEqual({
      price: 50,
    });
  });

  it("uses a promotional price alone when there is no regular one", () => {
    expect(readProductPrice({ promotional_price: 40 })).toEqual({ price: 40 });
  });

  it("reads numeric strings", () => {
    expect(readProductPrice({ price: "12.5" })).toEqual({ price: 12.5 });
  });

  it("is undefined without a usable price", () => {
    expect(readProductPrice(undefined)).toBeUndefined();
    expect(readProductPrice({})).toBeUndefined();
    expect(readProductPrice({ price: "" })).toBeUndefined();
    expect(readProductPrice({ price: "abc" })).toBeUndefined();
    expect(readProductPrice({ price: -1 })).toBeUndefined();
    expect(readProductPrice({ price: { value: 1 } })).toBeUndefined();
  });
});

describe("priceFormatter", () => {
  it("formats in the locale and currency", () => {
    expect(normalize(priceFormatter("pt-BR", "BRL")(1234.5))).toBe(
      "R$ 1.234,50",
    );
    expect(priceFormatter("en-US", "USD")(1234.5)).toBe("$1,234.50");
  });

  it("falls back to pt-BR and BRL when missing or invalid", () => {
    expect(normalize(priceFormatter()(10))).toBe("R$ 10,00");
    expect(normalize(priceFormatter("not a locale", "reais")(10))).toBe(
      "R$ 10,00",
    );
  });
});

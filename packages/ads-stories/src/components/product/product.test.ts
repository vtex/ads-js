import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "lit";
import { renderProduct, toCardProduct, type CardProduct } from "./product";

const format = (amount: number) => `$${amount.toFixed(2)}`;
const label = (name: string, price?: string, listPrice?: string) =>
  [name, listPrice, price].filter(Boolean).join(" | ");

const storyWith = (product: Record<string, unknown> | null) =>
  ({
    product: product && {
      product_sku: "sku-1",
      product_name: "Shoe",
      image_url: "https://example.com/shoe.jpg",
      product_metadata: {},
      ...product,
    },
  }) as Parameters<typeof toCardProduct>[0];

afterEach(() => {
  document.body.replaceChildren();
});

describe("toCardProduct", () => {
  it("has the name, image and formatted prices", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20, promotional_price: 15 } }),
      format,
      label,
    );

    expect(product).toEqual({
      name: "Shoe",
      imageUrl: "https://example.com/shoe.jpg",
      price: "$15.00",
      listPrice: "$20.00",
      label: "Shoe | $20.00 | $15.00",
    });
  });

  it("has no price when the metadata has none", () => {
    const product = toCardProduct(storyWith({}), format, label);

    expect(product?.price).toBeUndefined();
    expect(product?.listPrice).toBeUndefined();
    expect(product?.label).toBe("Shoe");
  });

  it("drops an image that isn't an absolute http(s) URL", () => {
    const product = toCardProduct(
      storyWith({ image_url: "javascript:alert(1)" }),
      format,
      label,
    );

    expect(product?.imageUrl).toBeUndefined();
  });

  it("is undefined without a product or a name", () => {
    expect(toCardProduct(storyWith(null), format, label)).toBeUndefined();
    expect(
      toCardProduct(storyWith({ product_name: "  " }), format, label),
    ).toBeUndefined();
  });
});

describe("renderProduct", () => {
  function mount(product: CardProduct) {
    const onSelect = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);
    render(renderProduct(product, onSelect), container);
    const button = container.querySelector<HTMLButtonElement>(".card-product");
    return { button, onSelect };
  }

  it("shows the image, name, price and the struck list price", () => {
    const { button } = mount({
      name: "Shoe",
      imageUrl: "https://example.com/shoe.jpg",
      price: "$15.00",
      listPrice: "$20.00",
      label: "Shoe, from $20.00 to $15.00",
    });

    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe(
      "Shoe, from $20.00 to $15.00",
    );
    const image = button?.querySelector(".product-image");
    expect(image?.getAttribute("src")).toBe("https://example.com/shoe.jpg");
    expect(image?.getAttribute("alt")).toBe("");
    expect(button?.querySelector(".product-name")?.textContent).toBe("Shoe");
    expect(button?.querySelector(".product-price")?.textContent).toContain(
      "$15.00",
    );
    expect(button?.querySelector("s.product-list-price")?.textContent).toBe(
      "$20.00",
    );
  });

  it("shows only the name without image or price", () => {
    const { button } = mount({ name: "Shoe", label: "Shoe" });

    expect(button?.querySelector(".product-image")).toBeNull();
    expect(button?.querySelector(".product-price")).toBeNull();
  });

  it("calls onSelect when clicked", () => {
    const { button, onSelect } = mount({ name: "Shoe", label: "Shoe" });

    button?.click();

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

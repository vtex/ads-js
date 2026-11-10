import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "lit";
import {
  renderExpandableProduct,
  renderProduct,
  toCardProduct,
  type CardProduct,
} from "./product";

const format = (amount: number) => `$${amount.toFixed(2)}`;
const label = (name: string, price?: string, listPrice?: string) =>
  [name, listPrice, price].filter(Boolean).join(" | ");

const storyWith = (product: Record<string, unknown> | null) =>
  ({
    product: product && {
      product_sku: "sku-1",
      product_name: "Shoe",
      image_url: "https://example.com/shoe.jpg",
      url: "https://example.com/shoe/p",
      product_metadata: {},
      ...product,
    },
    destination_url: "https://example.com/destination/p",
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
      url: "https://example.com/destination/p",
      label: "Shoe | $20.00 | $15.00",
    });
  });

  it("uses the fetched price over the metadata's", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20, promotional_price: 15 } }),
      format,
      label,
      { price: { price: 12, listPrice: 18 } },
    );

    expect(product).toMatchObject({
      price: "$12.00",
      listPrice: "$18.00",
      label: "Shoe | $18.00 | $12.00",
    });
    expect(product?.isLoading).toBeUndefined();
  });

  it("has no price while it loads", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20 } }),
      format,
      label,
      "loading",
    );

    expect(product).toMatchObject({ label: "Shoe", isLoading: true });
    expect(product?.price).toBeUndefined();
  });

  it("falls back to the metadata's price without a fetched one", () => {
    for (const fetched of [undefined, {}]) {
      const product = toCardProduct(
        storyWith({ product_metadata: { price: 20 } }),
        format,
        label,
        fetched,
      );

      expect(product?.price).toBe("$20.00");
      expect(product?.isLoading).toBeUndefined();
    }
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

  it("takes the Story's destination as the URL, not the product's", () => {
    const product = toCardProduct(storyWith({}), format, label);

    expect(product?.url).toBe("https://example.com/destination/p");
  });

  it("has no URL when the destination isn't an absolute http(s) URL", () => {
    const product = toCardProduct(
      { ...storyWith({}), destination_url: "javascript:alert(1)" },
      format,
      label,
    );

    expect(product?.url).toBeUndefined();
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

describe("renderExpandableProduct", () => {
  const product: CardProduct = {
    name: "Shoe",
    price: "$15.00",
    url: "https://example.com/shoe/p",
    label: "Shoe, $15.00",
  };
  const options = {
    panelId: "panel",
    addToCartLabel: "Add to cart",
    viewProductLabel: "View product",
  };

  function mount(item: CardProduct, open: boolean) {
    const onToggle = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);
    render(
      renderExpandableProduct(item, { ...options, open, onToggle }),
      container,
    );
    return { container, onToggle };
  }

  it("toggles from its button", () => {
    const { container, onToggle } = mount(product, false);

    container.querySelector<HTMLButtonElement>(".product-summary")?.click();

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("has no product page link without a URL", () => {
    const { container } = mount({ ...product, url: undefined }, true);

    expect(container.querySelector(".product-add-to-cart")).not.toBeNull();
    expect(container.querySelector(".product-view")).toBeNull();
  });

  it("has no add to cart while the product loads", () => {
    const { container } = mount({ ...product, isLoading: true }, true);

    expect(container.querySelector(".product-add-to-cart")).toBeNull();
    expect(container.querySelector(".product-view")).not.toBeNull();
  });

  it("shows a placeholder while the price loads", () => {
    const { container } = mount(
      { ...product, price: undefined, isLoading: true },
      false,
    );

    const skeleton = container.querySelector(".product-price-loading");
    expect(skeleton?.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton?.textContent?.trim()).toBe("");
  });
});

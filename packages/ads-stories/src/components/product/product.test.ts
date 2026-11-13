import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "lit";
import {
  renderExpandableProduct,
  renderProduct,
  toCardProduct,
  type CardProduct,
} from "./product";
import { en } from "../../locales";

const format = (amount: number) => `$${amount.toFixed(2)}`;
const label = (name: string, price?: string, listPrice?: string) =>
  [name, listPrice, price].filter(Boolean).join(" | ");
const labels = { ...en, product: label };

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
      labels,
    );

    expect(product).toEqual({
      name: "Shoe",
      imageUrl: "https://example.com/shoe.jpg",
      price: "$15.00",
      listPrice: "$20.00",
      url: "https://example.com/destination/p",
      sku: "sku-1",
      label: "Shoe | $20.00 | $15.00",
    });
  });

  it.each([
    ["blank", " "],
    ["empty", ""],
  ])("has no SKU when the product's is %s", (_, productSku) => {
    const product = toCardProduct(
      storyWith({ product_sku: productSku }),
      format,
      labels,
    );

    expect(product).toBeDefined();
    expect(product?.sku).toBeUndefined();
  });

  it("has the product's seller, trimmed, or none", () => {
    const withSeller = toCardProduct(
      storyWith({ seller_id: " 1 " }),
      format,
      labels,
    );
    const withoutSeller = toCardProduct(
      storyWith({ seller_id: " " }),
      format,
      labels,
    );

    expect(withSeller?.seller).toBe("1");
    expect(withoutSeller?.seller).toBeUndefined();
  });

  it("trims the SKU", () => {
    const product = toCardProduct(
      storyWith({ product_sku: " sku-1 " }),
      format,
      labels,
    );

    expect(product?.sku).toBe("sku-1");
  });

  it("uses the fetched price over the metadata's", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20, promotional_price: 15 } }),
      format,
      labels,
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
      labels,
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
        labels,
        fetched,
      );

      expect(product?.price).toBe("$20.00");
      expect(product?.isLoading).toBeUndefined();
    }
  });

  it("shows the sold out text when the product can't be bought and has no price", () => {
    const product = toCardProduct(storyWith({}), format, labels, {
      available: false,
    });

    expect(product).toMatchObject({
      soldOut: "Sold out",
      label: "Shoe | Sold out",
    });
    expect(product?.price).toBeUndefined();
    expect(product?.listPrice).toBeUndefined();
  });

  it("keeps the fetched price when the product can't be bought", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20 } }),
      format,
      labels,
      { price: { price: 12, listPrice: 15 }, available: false },
    );

    expect(product).toMatchObject({
      price: "$12.00",
      listPrice: "$15.00",
      soldOut: "Sold out",
      label: "Shoe | $15.00 | $12.00",
    });
  });

  it("keeps the ad server's price when the product can't be bought", () => {
    const product = toCardProduct(
      storyWith({ product_metadata: { price: 20 } }),
      format,
      labels,
      { available: false },
    );

    expect(product).toMatchObject({ price: "$20.00", soldOut: "Sold out" });
  });

  it("shows the price when the product can be bought", () => {
    const product = toCardProduct(storyWith({}), format, labels, {
      price: { price: 12 },
      available: true,
    });

    expect(product?.price).toBe("$12.00");
    expect(product?.soldOut).toBeUndefined();
  });

  it("has no price when the metadata has none", () => {
    const product = toCardProduct(storyWith({}), format, labels);

    expect(product?.price).toBeUndefined();
    expect(product?.listPrice).toBeUndefined();
    expect(product?.label).toBe("Shoe");
  });

  it("drops an image that isn't an absolute http(s) URL", () => {
    const product = toCardProduct(
      storyWith({ image_url: "javascript:alert(1)" }),
      format,
      labels,
    );

    expect(product?.imageUrl).toBeUndefined();
  });

  it("takes the Story's destination as the URL, not the product's", () => {
    const product = toCardProduct(storyWith({}), format, labels);

    expect(product?.url).toBe("https://example.com/destination/p");
  });

  it("keeps a path on the store as the URL", () => {
    const product = toCardProduct(
      { ...storyWith({}), destination_url: "/path-to-product/product-112" },
      format,
      labels,
    );

    expect(product?.url).toBe("/path-to-product/product-112");
  });

  it("has no URL when the destination isn't an http(s) URL or a store path", () => {
    const product = toCardProduct(
      { ...storyWith({}), destination_url: "javascript:alert(1)" },
      format,
      labels,
    );

    expect(product?.url).toBeUndefined();
  });

  it("is undefined without a product or a name", () => {
    expect(toCardProduct(storyWith(null), format, labels)).toBeUndefined();
    expect(
      toCardProduct(storyWith({ product_name: "  " }), format, labels),
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

  it("shows the sold out text in place of the price", () => {
    const { button } = mount({
      name: "Shoe",
      soldOut: "Sold out",
      label: "Shoe | Sold out",
    });

    expect(button?.querySelector(".product-sold-out")?.textContent).toBe(
      "Sold out",
    );
    expect(button?.querySelector(".product-list-price")).toBeNull();
  });

  it("shows the price, not the sold out text, when sold out with a price", () => {
    const { button } = mount({
      name: "Shoe",
      price: "$12.00",
      soldOut: "Sold out",
      label: "Shoe | $12.00",
    });

    expect(button?.querySelector(".product-price span")?.textContent).toBe(
      "$12.00",
    );
    expect(button?.querySelector(".product-sold-out")).toBeNull();
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
    sku: "sku-1",
    label: "Shoe, $15.00",
  };
  const options = {
    panelId: "panel",
    labels: en,
  };

  function mount(item: CardProduct, open: boolean, cartQuantity?: number) {
    const onToggle = vi.fn();
    const onAddToCart = vi.fn();
    const onRemoveFromCart = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);
    render(
      renderExpandableProduct(item, {
        ...options,
        open,
        onToggle,
        cartQuantity,
        onAddToCart,
        onRemoveFromCart,
      }),
      container,
    );
    return { container, onToggle, onAddToCart, onRemoveFromCart };
  }

  describe("stepper", () => {
    const query = (container: HTMLElement, selector: string) =>
      container.querySelector<HTMLButtonElement>(selector);

    it("takes add to cart's place once the product is in the cart", () => {
      const { container } = mount(product, true, 2);

      const stepper = container.querySelector(".product-stepper");
      expect(stepper?.getAttribute("role")).toBe("group");
      expect(stepper?.getAttribute("aria-label")).toBe("Quantity in cart");
      expect(
        container.querySelector(".product-quantity")?.textContent?.trim(),
      ).toBe("2");
      expect(container.querySelector(".product-add-to-cart")).toBeNull();
      expect(container.querySelector(".product-view")).not.toBeNull();
    });

    it("has minus above one, and a trash that removes with one left", () => {
      const two = mount(product, true, 2).container;
      const one = mount(product, true, 1).container;

      const minus = query(two, ".product-stepper-remove");
      const trash = query(one, ".product-stepper-remove");
      expect(minus?.getAttribute("aria-label")).toBe("Decrease quantity");
      expect(trash?.getAttribute("aria-label")).toBe("Remove from cart");
      expect(minus?.innerHTML).not.toBe(trash?.innerHTML);
      expect(
        query(two, ".product-stepper-add")?.getAttribute("aria-label"),
      ).toBe("Increase quantity");
    });

    it("calls onAddToCart from plus and onRemoveFromCart from minus", () => {
      const { container, onAddToCart, onRemoveFromCart, onToggle } = mount(
        product,
        true,
        1,
      );

      query(container, ".product-stepper-add")?.click();
      query(container, ".product-stepper-remove")?.click();

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onRemoveFromCart).toHaveBeenCalledTimes(1);
      expect(onToggle).not.toHaveBeenCalled();
    });

    it("shows add to cart with none in the cart", () => {
      const { container } = mount(product, true, 0);

      expect(container.querySelector(".product-stepper")).toBeNull();
      expect(container.querySelector(".product-add-to-cart")).not.toBeNull();
    });

    it("gives way to the unavailable button when sold out", () => {
      const { container } = mount({ ...product, soldOut: "Sold out" }, true, 2);

      expect(container.querySelector(".product-stepper")).toBeNull();
      expect(container.querySelector(".product-unavailable")).not.toBeNull();
    });

    it("gives way to the placeholder while the product loads", () => {
      const { container } = mount({ ...product, isLoading: true }, true, 2);

      expect(container.querySelector(".product-stepper")).toBeNull();
      expect(
        container.querySelector(".product-add-to-cart-loading"),
      ).not.toBeNull();
    });
  });

  it("calls onAddToCart from add to cart", () => {
    const { container, onAddToCart, onToggle } = mount(product, true);

    container.querySelector<HTMLButtonElement>(".product-add-to-cart")?.click();

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("has no add to cart without a SKU", () => {
    const { container } = mount({ ...product, sku: undefined }, true);

    expect(container.querySelector(".product-add-to-cart")).toBeNull();
    expect(container.querySelector(".product-view")).not.toBeNull();
  });

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

  it("has a disabled unavailable button in place of add to cart when sold out", () => {
    const { container } = mount({ ...product, soldOut: "Sold out" }, true);

    const unavailable = container.querySelector<HTMLButtonElement>(
      ".product-unavailable",
    );
    expect(unavailable?.disabled).toBe(true);
    expect(unavailable?.textContent?.trim()).toBe("Product unavailable");
    expect(container.querySelector(".product-add-to-cart")).toBeNull();
    expect(container.querySelector(".product-view")).not.toBeNull();
  });

  it("has a placeholder in place of add to cart while the product loads", () => {
    const { container } = mount({ ...product, isLoading: true }, true);

    const skeleton = container.querySelector(".product-add-to-cart-loading");
    expect(skeleton?.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton?.textContent?.trim()).toBe("");
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

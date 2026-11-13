import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "lit";
import { renderCta, toCardCta } from "./cta";

const storyWith = (story: {
  product?: Record<string, unknown> | null;
  destination_url?: string;
  call_to_action?: string | null;
}) =>
  ({
    product: null,
    destination_url: "https://example.com/campaign",
    call_to_action: "Saiba mais",
    ...story,
  }) as Parameters<typeof toCardCta>[0];

afterEach(() => {
  document.body.replaceChildren();
});

describe("toCardCta", () => {
  it("has the campaign's text and the destination of a Story without a product", () => {
    expect(toCardCta(storyWith({}))).toEqual({
      label: "Saiba mais",
      url: "https://example.com/campaign",
    });
  });

  it("trims the text", () => {
    expect(
      toCardCta(storyWith({ call_to_action: "  Ver oferta " }))?.label,
    ).toBe("Ver oferta");
  });

  it("is undefined for a Story with a product", () => {
    const story = storyWith({ product: { product_name: "Shoe" } });

    expect(toCardCta(story)).toBeUndefined();
  });

  it("is undefined without a text", () => {
    for (const call_to_action of [undefined, null, "", "   "]) {
      expect(toCardCta(storyWith({ call_to_action }))).toBeUndefined();
    }
  });

  it("is undefined without an http(s) or same-store path destination", () => {
    for (const destination_url of [
      "",
      "javascript:alert(1)",
      "//evil.com",
      "/\\evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
      "/\r/evil.com",
      "/\r\n/evil.com",
      "/.//evil.com",
      "/a/..//evil.com",
      "campaign",
    ]) {
      expect(toCardCta(storyWith({ destination_url }))).toBeUndefined();
    }
  });

  it("keeps a path on the store as the destination", () => {
    expect(
      toCardCta(storyWith({ destination_url: "/campaign?a=1" }))?.url,
    ).toBe("/campaign?a=1");
  });
});

describe("renderCta", () => {
  const cta = { label: "Saiba mais", url: "https://example.com/campaign" };

  function mount(onSelect?: () => void) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    render(renderCta(cta, onSelect), container);
    const link = container.querySelector<HTMLAnchorElement>(".card-cta");
    if (!link) throw new Error("The call to action did not render");
    return link;
  }

  it("links to the destination in a new tab, with its text and a caret", () => {
    const link = mount();

    expect(link.href).toBe(cta.url);
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
    expect(link.textContent?.trim()).toBe("Saiba mais");
    expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("follows the link without onSelect", () => {
    const link = mount();
    let prevented: boolean | undefined;
    // After the link's own listener; cancels it so the test doesn't navigate.
    document.body.addEventListener(
      "click",
      (event) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    link.click();

    expect(prevented).toBe(false);
  });

  it("calls onSelect instead of following the link", () => {
    const onSelect = vi.fn();
    const link = mount(onSelect);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });
});

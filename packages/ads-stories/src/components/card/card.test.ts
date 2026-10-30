import { describe, it, expect, vi } from "vitest";
import { createCard } from "./card";

describe("createCard", () => {
  it("renders the poster", () => {
    const card = createCard({
      ad_id: "1",
      poster_url: "https://example.com/cover.jpg",
    });

    const poster = card.querySelector<HTMLImageElement>(".poster");
    expect(poster?.src).toBe("https://example.com/cover.jpg");
    expect(poster?.alt).toBe("");
  });

  it("renders no poster without a poster_url", () => {
    const card = createCard({ ad_id: "1" });
    expect(card.querySelector(".poster")).toBeNull();
  });

  it.each(["javascript:alert(1)", "data:image/png;base64,AAAA", "/cover.jpg"])(
    "ignores a poster_url that is not an absolute http(s) URL: %s",
    (posterUrl) => {
      const card = createCard({ ad_id: "1", poster_url: posterUrl });
      expect(card.querySelector(".poster")).toBeNull();
    },
  );
});

describe("createCard with options", () => {
  function interactiveCard() {
    const onSelect = vi.fn();
    const card = createCard(
      { ad_id: "1" },
      { label: "Assistir vídeo", onSelect },
    );
    return { card, onSelect };
  }

  it("is a focusable button with a play icon", () => {
    const { card } = interactiveCard();

    expect(card.getAttribute("role")).toBe("button");
    expect(card.getAttribute("aria-label")).toBe("Assistir vídeo");
    expect(card.tabIndex).toBe(0);
    expect(card.querySelector(".play")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(card.querySelector(".play svg.icon")).not.toBeNull();
  });

  it("calls onSelect on click, Enter and Space", () => {
    const { card, onSelect } = interactiveCard();

    card.click();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it("is not a button without options", () => {
    const card = createCard({ ad_id: "1" });

    expect(card.getAttribute("role")).toBeNull();
    expect(card.querySelector(".play")).toBeNull();
  });
});

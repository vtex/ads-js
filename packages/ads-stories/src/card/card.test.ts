import { describe, it, expect } from "vitest";
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

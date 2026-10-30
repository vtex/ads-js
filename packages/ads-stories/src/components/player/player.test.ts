import { describe, it, expect, vi } from "vitest";
import { createPlayer } from "./player";

describe("createPlayer", () => {
  const story = { ad_id: "1", poster_url: "https://example.com/cover.jpg" };
  const options = { label: "Vídeo", closeLabel: "Fechar vídeo" };

  it("is a manual popover dialog with the Story card", () => {
    const player = createPlayer(story, { ...options, onClose: vi.fn() });

    expect(player.getAttribute("popover")).toBe("manual");
    expect(player.getAttribute("role")).toBe("dialog");
    expect(player.getAttribute("aria-label")).toBe("Vídeo");
    expect(player.querySelector(".card .poster")?.getAttribute("src")).toBe(
      "https://example.com/cover.jpg",
    );
    // The card inside the player does not open another player.
    expect(player.querySelector(".card")?.getAttribute("role")).toBeNull();
  });

  it("calls onClose from the close button", () => {
    const onClose = vi.fn();
    const player = createPlayer(story, { ...options, onClose });

    const close = player.querySelector("button");
    expect(close?.getAttribute("aria-label")).toBe("Fechar vídeo");
    expect(close?.querySelector("svg.icon")).not.toBeNull();
    close?.click();

    expect(onClose).toHaveBeenCalledOnce();
  });
});

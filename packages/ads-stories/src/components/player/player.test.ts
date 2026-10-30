import { describe, it, expect, vi } from "vitest";
import { createPlayer } from "./player";

describe("createPlayer", () => {
  const story = { ad_id: "1", poster_url: "https://example.com/cover.jpg" };
  const labels = {
    label: "Vídeo",
    expandLabel: "Expandir vídeo",
    collapseLabel: "Reduzir vídeo",
    closeLabel: "Fechar vídeo",
  };

  function setup() {
    const onClose = vi.fn();
    const player = createPlayer(story, { ...labels, onClose });
    const expand = player.querySelector<HTMLButtonElement>(".player-expand");
    const close = player.querySelector<HTMLButtonElement>(".player-close");
    return { player, expand, close, onClose };
  }

  it("is a manual popover dialog with the Story card", () => {
    const { player } = setup();

    expect(player.getAttribute("popover")).toBe("manual");
    expect(player.getAttribute("role")).toBe("dialog");
    expect(player.getAttribute("aria-label")).toBe("Vídeo");
    expect(player.querySelector(".card .poster")?.getAttribute("src")).toBe(
      "https://example.com/cover.jpg",
    );
    // The card inside the player does not open another player.
    expect(player.querySelector(".card")?.getAttribute("role")).toBeNull();
  });

  it("opens as the mini player, with expand beside close", () => {
    const { player, expand, close } = setup();

    expect(player.hasAttribute("data-expanded")).toBe(false);
    const buttons = [...player.querySelectorAll(".player-controls button")];
    expect(buttons).toEqual([expand, close]);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
    expect(close?.getAttribute("aria-label")).toBe("Fechar vídeo");
  });

  it("toggles the expanded view from the expand button", () => {
    const { player, expand } = setup();

    expand?.click();
    expect(player.hasAttribute("data-expanded")).toBe(true);
    expect(expand?.getAttribute("aria-label")).toBe("Reduzir vídeo");
    expect(expand?.querySelectorAll("svg.icon")).toHaveLength(1);

    expand?.click();
    expect(player.hasAttribute("data-expanded")).toBe(false);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
  });

  it("calls onClose from the close button", () => {
    const { close, onClose } = setup();

    expect(close?.querySelector("svg.icon")).not.toBeNull();
    close?.click();

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the backdrop of the expanded view is clicked", () => {
    const { player, expand, onClose } = setup();

    player.click();
    expect(onClose).not.toHaveBeenCalled();

    expand?.click();
    player.querySelector<HTMLElement>(".card")?.click();
    expect(onClose).not.toHaveBeenCalled();

    player.click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

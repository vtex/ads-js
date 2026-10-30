import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { installDialogMocks, shownAs } from "./dialog.mock";
import { createPlayer, showPlayer } from "./player";

describe("createPlayer", () => {
  const story = { ad_id: "1", poster_url: "https://example.com/cover.jpg" };
  const labels = {
    label: "Vídeo",
    expandLabel: "Expandir vídeo",
    collapseLabel: "Reduzir vídeo",
    closeLabel: "Fechar vídeo",
  };

  beforeAll(() => {
    installDialogMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mounted and shown as the element does it.
  function setup() {
    const onClose = vi.fn();
    const player = createPlayer(story, { ...labels, onClose });
    document.body.append(player);
    showPlayer(player);

    const expand = player.querySelector<HTMLButtonElement>(".player-expand");
    const close = player.querySelector<HTMLButtonElement>(".player-close");
    return { player, expand, close, onClose };
  }

  it("is a dialog with the Story card", () => {
    const { player } = setup();

    expect(player.tagName).toBe("DIALOG");
    expect(player.getAttribute("aria-label")).toBe("Vídeo");
    expect(player.querySelector(".card .poster")?.getAttribute("src")).toBe(
      "https://example.com/cover.jpg",
    );
    // The card inside the player does not open another player.
    expect(player.querySelector(".card")?.getAttribute("role")).toBeNull();
  });

  it("opens as the mini player, a manual popover, with expand beside close", () => {
    const { player, expand, close } = setup();

    expect(player.getAttribute("popover")).toBe("manual");
    expect(shownAs(player)).toBe("popover");
    expect(player.hasAttribute("data-expanded")).toBe(false);

    const buttons = [...player.querySelectorAll(".player-controls button")];
    expect(buttons).toEqual([expand, close]);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
    expect(close?.getAttribute("aria-label")).toBe("Fechar vídeo");
  });

  it("shows the mini player as a non-modal dialog without popover support", () => {
    const showPopover = HTMLElement.prototype.showPopover;
    // @ts-expect-error simulating a browser without popovers
    delete HTMLElement.prototype.showPopover;
    try {
      const { player } = setup();
      expect(shownAs(player)).toBe("non-modal");
    } finally {
      HTMLElement.prototype.showPopover = showPopover;
    }
  });

  it("expands as a modal dialog and collapses back to the popover", () => {
    const { player, expand } = setup();

    expand?.click();
    expect(shownAs(player)).toBe("modal");
    expect(player.hasAttribute("data-expanded")).toBe(true);
    expect(expand?.getAttribute("aria-label")).toBe("Reduzir vídeo");
    expect(expand?.querySelectorAll("svg.icon")).toHaveLength(1);
    expect(document.activeElement).toBe(expand);

    expand?.click();
    expect(shownAs(player)).toBe("popover");
    expect(player.hasAttribute("data-expanded")).toBe(false);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
    expect(document.activeElement).toBe(expand);
  });

  it("only fades in on the first opening", () => {
    const { player, expand } = setup();
    expect(player.hasAttribute("data-switched")).toBe(false);

    expand?.click();
    expand?.click();
    expect(player.hasAttribute("data-switched")).toBe(true);
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

  it("closes the player instead of only hiding the dialog on Escape", () => {
    const { player, expand, onClose } = setup();
    expand?.click();

    const cancel = new Event("cancel", { cancelable: true });
    player.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

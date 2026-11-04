import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { mountHost } from "../host.mock";
import { installMediaMocks } from "../media/media.mock";
import { installDialogMocks, shownAs } from "./dialog.mock";
import { PlayerController } from "./player";
import type { StoryMedia } from "../../types";

describe("PlayerController", () => {
  const story = { poster_url: "https://example.com/cover.jpg" };
  const labels = {
    label: "Vídeo",
    expandLabel: "Expandir vídeo",
    collapseLabel: "Reduzir vídeo",
    closeLabel: "Fechar vídeo",
    playLabel: "Reproduzir vídeo",
    pauseLabel: "Pausar vídeo",
    soundOnLabel: "Ativar som",
    soundOffLabel: "Desativar som",
  };

  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  // Rendered and opened as the element does it. onClose closes the player.
  async function setup(storyToPlay: StoryMedia = story) {
    const onClose = vi.fn(() => controller.close());
    const { host, container, controller } = mountHost(
      (host) => new PlayerController(host, { ...labels, onClose }),
      (player) => player.render(storyToPlay),
    );
    await controller.open();

    const player = container.querySelector("dialog");
    if (!player) throw new Error("The player did not render");
    const expand = player.querySelector<HTMLButtonElement>(".player-expand");
    const close = player.querySelector<HTMLButtonElement>(".player-close");
    // Waits for the mode switch, which shows the dialog again after an update.
    const toggleExpanded = async () => {
      expand?.click();
      await vi.waitFor(() => expect(shownAs(player)).not.toBeNull());
    };
    return {
      controller,
      host,
      container,
      player,
      expand,
      close,
      onClose,
      toggleExpanded,
    };
  }

  it("renders nothing until opened", () => {
    const { container } = mountHost(
      (host) => new PlayerController(host, { ...labels, onClose: vi.fn() }),
      (player) => player.render(story),
    );

    expect(container.querySelector("dialog")).toBeNull();
  });

  it("is a dialog with the Story card", async () => {
    const { player } = await setup();

    expect(player.getAttribute("aria-label")).toBe("Vídeo");
    expect(player.querySelector(".card .poster")?.getAttribute("src")).toBe(
      "https://example.com/cover.jpg",
    );
    // The card inside the player does not open another player.
    expect(player.querySelector(".card")?.getAttribute("role")).toBeNull();
  });

  it("opens as the mini player, a manual popover, with expand beside close", async () => {
    const { player, expand, close } = await setup();

    expect(player.getAttribute("popover")).toBe("manual");
    expect(shownAs(player)).toBe("popover");
    expect(player.hasAttribute("data-expanded")).toBe(false);

    const buttons = [...player.querySelectorAll(".player-controls button")];
    expect(buttons).toEqual([expand, close]);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
    expect(close?.getAttribute("aria-label")).toBe("Fechar vídeo");
    expect(document.activeElement).toBe(close);
  });

  it("shows the mini player as a non-modal dialog without popover support", async () => {
    const showPopover = HTMLElement.prototype.showPopover;
    // @ts-expect-error simulating a browser without popovers
    delete HTMLElement.prototype.showPopover;
    try {
      const { player } = await setup();
      expect(shownAs(player)).toBe("non-modal");
    } finally {
      HTMLElement.prototype.showPopover = showPopover;
    }
  });

  it("expands as a modal dialog and collapses back to the popover", async () => {
    const { player, expand, toggleExpanded } = await setup();

    await toggleExpanded();
    expect(shownAs(player)).toBe("modal");
    expect(player.hasAttribute("data-expanded")).toBe(true);
    expect(expand?.getAttribute("aria-label")).toBe("Reduzir vídeo");
    expect(expand?.querySelectorAll("svg.icon")).toHaveLength(1);
    expect(document.activeElement).toBe(expand);

    await toggleExpanded();
    expect(shownAs(player)).toBe("popover");
    expect(player.hasAttribute("data-expanded")).toBe(false);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
    expect(document.activeElement).toBe(expand);
  });

  it("survives two expand clicks in the same task", async () => {
    const { player, expand } = await setup();

    // The second click toggles back before the first one shows the dialog.
    expand?.click();
    expand?.click();
    await vi.waitFor(() => expect(shownAs(player)).toBe("popover"));
    // Any error from showing the dialog twice would surface by now.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(shownAs(player)).toBe("popover");
    expect(player.hasAttribute("data-expanded")).toBe(false);
    expect(expand?.getAttribute("aria-label")).toBe("Expandir vídeo");
  });

  it("only fades in on the first opening", async () => {
    const { player, toggleExpanded } = await setup();
    expect(player.hasAttribute("data-switched")).toBe(false);

    await toggleExpanded();
    await toggleExpanded();
    expect(player.hasAttribute("data-switched")).toBe(true);
  });

  it("calls onClose from the close button, and close() removes it", async () => {
    const { container, close, onClose } = await setup();

    expect(close?.querySelector("svg.icon")).not.toBeNull();
    close?.click();

    expect(onClose).toHaveBeenCalledOnce();
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("hides the expanded view when it closes", async () => {
    const { controller, player, toggleExpanded } = await setup();
    await toggleExpanded();

    controller.close();
    expect(shownAs(player)).toBeNull();
  });

  it("opens again after closing, as the mini player", async () => {
    const { controller, container, toggleExpanded } = await setup();
    await toggleExpanded();
    controller.close();

    await controller.open();
    const player = container.querySelector("dialog");
    expect(player).not.toBeNull();
    expect(player?.hasAttribute("data-expanded")).toBe(false);
    expect(shownAs(player as Element)).toBe("popover");
  });

  it("closes when the backdrop of the expanded view is clicked", async () => {
    const { player, toggleExpanded, onClose } = await setup();

    player.click();
    expect(onClose).not.toHaveBeenCalled();

    await toggleExpanded();
    player.querySelector<HTMLElement>(".card")?.click();
    expect(onClose).not.toHaveBeenCalled();

    player.click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes the player instead of only hiding the dialog on Escape", async () => {
    const { player, toggleExpanded, onClose } = await setup();
    await toggleExpanded();

    const cancel = new Event("cancel", { cancelable: true });
    player.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape anywhere on the page, and stops listening after", async () => {
    const { onClose } = await setup();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(onClose).not.toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the host leaves the page", async () => {
    const { host, container, onClose } = await setup();
    host.disconnect();

    expect(container.querySelector("dialog")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  describe("video", () => {
    const withVideo = { ...story, media_url: "https://example.com/story.mp4" };

    async function setupWithVideo() {
      const result = await setup(withVideo);
      const { player } = result;
      return {
        ...result,
        video: player.querySelector("video"),
        toggle: () => player.querySelector<HTMLButtonElement>(".player-toggle"),
        sound: () => player.querySelector<HTMLButtonElement>(".player-sound"),
      };
    }

    it("has no video controls without a video", async () => {
      const { player } = await setup();

      expect(player.querySelector(".player-toggle")).toBeNull();
      expect(player.querySelector(".player-sound")).toBeNull();
      expect(player.hasAttribute("data-paused")).toBe(false);
    });

    it("plays muted when it opens", async () => {
      const { player, video, toggle } = await setupWithVideo();

      expect(video?.muted).toBe(true);
      expect(video?.paused).toBe(false);
      expect(player.hasAttribute("data-paused")).toBe(false);
      expect(toggle()?.getAttribute("aria-label")).toBe("Pausar vídeo");
    });

    it("plays and pauses from the button in the middle", async () => {
      const { player, video, toggle } = await setupWithVideo();

      toggle()?.click();
      expect(video?.paused).toBe(true);
      expect(player.hasAttribute("data-paused")).toBe(true);
      expect(toggle()?.getAttribute("aria-label")).toBe("Reproduzir vídeo");

      toggle()?.click();
      expect(video?.paused).toBe(false);
      expect(toggle()?.getAttribute("aria-label")).toBe("Pausar vídeo");
    });

    it("plays and pauses when the video is clicked", async () => {
      const { player, video } = await setupWithVideo();

      player.querySelector<HTMLElement>(".card")?.click();
      expect(video?.paused).toBe(true);

      player.querySelector<HTMLElement>(".card")?.click();
      expect(video?.paused).toBe(false);
    });

    it("turns the sound on and off", async () => {
      const { video, sound } = await setupWithVideo();
      expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");

      sound()?.click();
      video?.dispatchEvent(new Event("volumechange"));
      expect(video?.muted).toBe(false);
      expect(sound()?.getAttribute("aria-label")).toBe("Desativar som");
      // The click stays on the sound button: it does not also pause the video.
      expect(video?.paused).toBe(false);

      sound()?.click();
      video?.dispatchEvent(new Event("volumechange"));
      expect(video?.muted).toBe(true);
      expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
    });

    it("removes the controls when the video fails, leaving the cover", async () => {
      const { player, video } = await setupWithVideo();
      video?.dispatchEvent(new Event("error"));

      expect(player.querySelector("video")).toBeNull();
      expect(player.querySelector(".player-toggle")).toBeNull();
      expect(player.querySelector(".player-sound")).toBeNull();
      expect(player.hasAttribute("data-paused")).toBe(false);
      expect(player.querySelector(".poster")).not.toBeNull();
    });
  });
});

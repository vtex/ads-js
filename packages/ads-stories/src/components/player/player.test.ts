import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { mountHost } from "../host.mock";
import { installMediaMocks } from "../media/media.mock";
import { installDialogMocks, shownAs } from "./dialog.mock";
import {
  FAR_GAP,
  NEAR_GAP,
  neighborOffsets,
  PlayerController,
  type PlayerRenderOptions,
} from "./player";
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
    previousLabel: "Vídeo anterior",
    nextLabel: "Próximo vídeo",
    neighborLabel: "Mostrar vídeo",
    addToCartLabel: "Adicionar ao carrinho",
    viewProductLabel: "Ver produto",
  };

  beforeAll(() => {
    installDialogMocks();
    installMediaMocks();
  });

  // Players a test opened: an open player listens for keys on the page, and
  // would still react to the next test's.
  const opened: PlayerController[] = [];

  afterEach(() => {
    for (const controller of opened.splice(0)) controller.close();
    document.body.replaceChildren();
  });

  // Rendered and opened as the element does it. onClose closes the player.
  async function setup(
    storyToPlay: StoryMedia = story,
    renderOptions?: PlayerRenderOptions,
    openOptions?: Parameters<PlayerController["open"]>[0],
  ) {
    const onClose = vi.fn(() => controller.close());
    const { host, container, controller } = mountHost(
      (host) => new PlayerController(host, { ...labels, onClose }),
      (player) => player.render(storyToPlay, renderOptions),
    );
    opened.push(controller);
    await controller.open(openOptions);

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
    // Showing the dialog twice would be an unhandled rejection, which fails
    // the run.
    await vi.waitFor(() => expect(shownAs(player)).toBe("popover"));

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

    opened.push(controller);
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

  describe("product", () => {
    const product = {
      name: "Tênis",
      imageUrl: "https://example.com/shoe.jpg",
      price: "R$ 129,90",
      listPrice: "R$ 159,90",
      url: "https://www.example.com/tenis/p",
      label: "Tênis, de R$ 159,90 por R$ 129,90",
    };
    const withVideo = { ...story, media_url: "https://example.com/story.mp4" };

    async function setupWithProduct(
      openOptions?: Parameters<PlayerController["open"]>[0],
      storyToPlay: StoryMedia = withVideo,
    ) {
      const result = await setup(storyToPlay, { product }, openOptions);
      const { player } = result;
      return {
        ...result,
        pill: () => player.querySelector<HTMLElement>(".card .card-product"),
        summary: () =>
          player.querySelector<HTMLButtonElement>(".product-summary"),
        panel: () => player.querySelector<HTMLElement>(".product-panel"),
        video: player.querySelector("video"),
      };
    }

    it("shows the pill at the bottom of the video, closed", async () => {
      const { pill, summary, panel } = await setupWithProduct();

      expect(pill()?.hasAttribute("data-open")).toBe(false);
      expect(summary()?.getAttribute("aria-label")).toBe(product.label);
      expect(summary()?.getAttribute("aria-expanded")).toBe("false");
      expect(summary()?.getAttribute("aria-controls")).toBe(panel()?.id);
      expect(panel()?.hasAttribute("inert")).toBe(true);
      expect(pill()?.querySelector(".product-name")?.textContent).toBe("Tênis");
    });

    it("has no pill without a product", async () => {
      const { player } = await setup();

      expect(player.querySelector(".card-product")).toBeNull();
    });

    it("opens and closes the panel from the pill, without pausing", async () => {
      const { pill, summary, panel, video } = await setupWithProduct();

      summary()?.click();
      expect(pill()?.hasAttribute("data-open")).toBe(true);
      expect(summary()?.getAttribute("aria-expanded")).toBe("true");
      expect(panel()?.hasAttribute("inert")).toBe(false);

      summary()?.click();
      expect(pill()?.hasAttribute("data-open")).toBe(false);
      expect(video?.paused).toBe(false);
    });

    it("has add to cart and the product page in a new tab", async () => {
      const { summary, panel } = await setupWithProduct();
      summary()?.click();

      const addToCart = panel()?.querySelector(".product-add-to-cart");
      expect(addToCart?.tagName).toBe("BUTTON");
      expect(addToCart?.textContent?.trim()).toBe("Adicionar ao carrinho");
      const view = panel()?.querySelector<HTMLAnchorElement>(".product-view");
      expect(view?.textContent?.trim()).toBe("Ver produto");
      expect(view?.href).toBe(product.url);
      expect(view?.target).toBe("_blank");
      expect(view?.rel).toBe("noopener noreferrer");
    });

    it("opens with the panel open when asked", async () => {
      const { pill } = await setupWithProduct({ productOpen: true });

      expect(pill()?.hasAttribute("data-open")).toBe(true);
    });

    it("closes the panel on a click on the video, without pausing", async () => {
      const { player, pill, video } = await setupWithProduct({
        productOpen: true,
      });

      player.querySelector<HTMLElement>(".card")?.click();

      expect(pill()?.hasAttribute("data-open")).toBe(false);
      expect(video?.paused).toBe(false);
    });

    it("closes the panel on a step", async () => {
      const { controller, pill } = await setupWithProduct({
        productOpen: true,
      });

      await controller.showNext(1);

      expect(pill()?.hasAttribute("data-open")).toBe(false);
    });

    it("opens closed again after closing", async () => {
      const { container, controller, summary } = await setupWithProduct();
      summary()?.click();

      controller.close();
      await controller.open();

      // A new dialog: the one from setup was removed with the close.
      const pill = container.querySelector(".card .card-product");
      expect(pill?.hasAttribute("data-open")).toBe(false);
    });

    it("keeps the panel open when switching to the expanded view", async () => {
      const { player, toggleExpanded, pill } = await setupWithProduct({
        productOpen: true,
      });
      await toggleExpanded();

      expect(player.hasAttribute("data-expanded")).toBe(true);
      expect(pill()?.hasAttribute("data-open")).toBe(true);
    });
  });

  describe("call to action", () => {
    const cta = {
      label: "Saiba mais",
      url: "https://www.example.com/campaign",
    };
    const withVideo = { ...story, media_url: "https://example.com/story.mp4" };

    it("shows the call to action at the bottom of the video", async () => {
      const { player } = await setup(withVideo, { cta });
      const link = player.querySelector<HTMLAnchorElement>(".card .card-cta");

      expect(link?.href).toBe(cta.url);
      expect(link?.target).toBe("_blank");
      expect(link?.textContent?.trim()).toBe("Saiba mais");
      expect(player.querySelector(".card-product")).toBeNull();
    });

    it("has no call to action without one", async () => {
      const { player } = await setup();

      expect(player.querySelector(".card-cta")).toBeNull();
    });

    it("doesn't pause the video when clicked", async () => {
      const { player } = await setup(withVideo, { cta });
      const video = player.querySelector("video");
      const link = player.querySelector<HTMLAnchorElement>(".card-cta");
      if (!video || !link) throw new Error("The video or the link is missing");
      // The test doesn't navigate.
      link.addEventListener("click", (event) => event.preventDefault());
      expect(video.paused).toBe(false);
      const pause = vi.spyOn(video, "pause");

      link.click();

      expect(pause).not.toHaveBeenCalled();
      expect(video.paused).toBe(false);
    });
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

  describe("navigation", () => {
    const videoStory = {
      poster_url: "https://example.com/cover.jpg",
      media_url: "https://example.com/video.mp4",
    };

    // Opened with previous and next, as the element does with more than one
    // Story.
    async function setupWithNavigation(
      navigation = true,
      renderOptions: PlayerRenderOptions = {},
    ) {
      const onStep = vi.fn();
      const { container, controller } = mountHost(
        (host) =>
          new PlayerController(host, { ...labels, onClose: vi.fn(), onStep }),
        (player) => player.render(videoStory, { navigation, ...renderOptions }),
      );
      opened.push(controller);
      await controller.open();
      const player = container.querySelector("dialog");
      if (!player) throw new Error("The player did not render");
      return { controller, player, onStep };
    }

    it("has no previous and next without navigation", async () => {
      const { player } = await setupWithNavigation(false);
      expect(player.querySelector(".player-nav")).toBeNull();
    });

    it("puts previous and next above the mini player's top left", async () => {
      const { player } = await setupWithNavigation();
      const buttons = [...player.querySelectorAll(".player-nav button")];

      expect(
        buttons.map((button) => button.getAttribute("aria-label")),
      ).toEqual(["Vídeo anterior", "Próximo vídeo"]);
    });

    it("steps back and forth", async () => {
      const { player, onStep } = await setupWithNavigation();

      player.querySelector<HTMLButtonElement>(".player-previous")?.click();
      player.querySelector<HTMLButtonElement>(".player-next")?.click();

      expect(onStep.mock.calls).toEqual([[-1], [1]]);
    });

    async function expand(player: HTMLDialogElement) {
      player.querySelector<HTMLButtonElement>(".player-expand")?.click();
      await vi.waitFor(() => expect(shownAs(player)).toBe("modal"));
    }

    const neighbor = (offset: number) => ({
      offset,
      story: { poster_url: `https://example.com/cover${offset}.jpg` },
    });

    it("keeps previous and next while expanded", async () => {
      const { player } = await setupWithNavigation();

      await expand(player);

      expect(player.querySelectorAll(".player-nav button")).toHaveLength(2);
    });

    it("shows the other Stories beside the expanded video only", async () => {
      const { player } = await setupWithNavigation(true, {
        neighbors: [neighbor(-1), neighbor(1), neighbor(-2)],
      });
      expect(player.querySelector(".player-neighbor")).toBeNull();

      await expand(player);

      const neighbors = [
        ...player.querySelectorAll<HTMLElement>(".player-neighbor"),
      ];
      expect(
        neighbors.map((button) => [
          button.style.getPropertyValue("--side"),
          button.style.getPropertyValue("--beyond"),
          button.querySelector("img")?.getAttribute("src"),
        ]),
      ).toEqual([
        ["-1", "0", "https://example.com/cover-1.jpg"],
        ["1", "0", "https://example.com/cover1.jpg"],
        ["-1", "-1", "https://example.com/cover-2.jpg"],
      ]);
      expect(neighbors[0].getAttribute("aria-label")).toBe("Mostrar vídeo");
      expect(player.hasAttribute("data-pair")).toBe(false);
    });

    it("steps to another Story when its cover is clicked", async () => {
      const { player, onStep } = await setupWithNavigation(true, {
        neighbors: [neighbor(-1), neighbor(2)],
      });
      await expand(player);

      player.querySelectorAll<HTMLElement>(".player-neighbor")[1].click();

      expect(onStep).toHaveBeenCalledWith(2);
      // Not a click on the backdrop: the player stays open.
      expect(shownAs(player)).toBe("modal");
    });

    // The single cover's offset flips on each step: its button stays, so a
    // keyboard user who chose it keeps the focus.
    it("keeps the single cover's button across steps with two", async () => {
      let neighbors = [neighbor(1)];
      const { container, controller } = mountHost(
        (host) => new PlayerController(host, { ...labels, onClose: vi.fn() }),
        (player) => player.render(videoStory, { navigation: true, neighbors }),
      );
      opened.push(controller);
      await controller.open();
      const player = container.querySelector("dialog");
      if (!player) throw new Error("The player did not render");
      await expand(player);
      const cover = player.querySelector(".player-neighbor");

      neighbors = [neighbor(-1)];
      await controller.showNext(1);

      expect(player.querySelector(".player-neighbor")).toBe(cover);
    });

    it("names each cover with its own label", async () => {
      const { player } = await setupWithNavigation(true, {
        neighbors: [
          { ...neighbor(-1), label: "Mostrar vídeo 3 de 3" },
          neighbor(1),
        ],
      });

      await expand(player);

      expect(
        [...player.querySelectorAll(".player-neighbor")].map((cover) =>
          cover.getAttribute("aria-label"),
        ),
      ).toEqual(["Mostrar vídeo 3 de 3", "Mostrar vídeo"]);
    });

    it("moves the video off center, away from the other Story, with two", async () => {
      const { player } = await setupWithNavigation(true, {
        neighbors: [neighbor(1)],
      });

      await expand(player);

      expect(player.hasAttribute("data-pair")).toBe(true);
      expect(player.style.getPropertyValue("--pair-dir")).toBe("-1");
    });

    it("loops in the mini player, moves on when it ends expanded", async () => {
      const { player, onStep } = await setupWithNavigation();
      expect(player.querySelector("video")?.loop).toBe(true);

      await expand(player);
      const video = player.querySelector("video");
      expect(video?.loop).toBe(false);

      video?.dispatchEvent(new Event("ended"));
      expect(onStep).toHaveBeenCalledWith(1);
    });

    describe("arrow keys", () => {
      // A key pressed with the focus on `target`, by default the player's
      // close button (focused when it opens).
      const press = (
        target: EventTarget | null | undefined,
        key: string,
        init: KeyboardEventInit = {},
      ) => {
        const event = new KeyboardEvent("keydown", {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
          ...init,
        });
        target?.dispatchEvent(event);
        return event;
      };

      const closeButton = (player: HTMLDialogElement) =>
        player.querySelector(".player-close");

      it("steps with the left and right arrows inside the player", async () => {
        const { player, onStep } = await setupWithNavigation();

        const left = press(closeButton(player), "ArrowLeft");
        press(player.querySelector(".player-sound"), "ArrowRight");

        expect(onStep.mock.calls).toEqual([[-1], [1]]);
        // The arrow doesn't also scroll the page.
        expect(left.defaultPrevented).toBe(true);
      });

      it("steps while expanded too", async () => {
        const { player, onStep } = await setupWithNavigation();
        await expand(player);

        press(player.querySelector(".player-expand"), "ArrowRight");

        expect(onStep).toHaveBeenCalledWith(1);
      });

      it("leaves the arrows pressed elsewhere on the page alone", async () => {
        const { onStep } = await setupWithNavigation();
        const gallery = document.createElement("button");
        document.body.append(gallery);

        const event = press(gallery, "ArrowRight");

        expect(onStep).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(false);
      });

      it("ignores the arrows with a single Story", async () => {
        const { player, onStep } = await setupWithNavigation(false);

        const event = press(closeButton(player), "ArrowRight");

        expect(onStep).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(false);
      });

      it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])(
        "ignores the arrows with %s",
        async (modifier) => {
          const { player, onStep } = await setupWithNavigation();

          press(closeButton(player), "ArrowLeft", { [modifier]: true });

          expect(onStep).not.toHaveBeenCalled();
        },
      );

      it("ignores an arrow already handled", async () => {
        const { player, onStep } = await setupWithNavigation();
        const button = closeButton(player);
        button?.addEventListener("keydown", (event) => event.preventDefault());

        press(button, "ArrowRight");

        expect(onStep).not.toHaveBeenCalled();
      });

      it("keeps the focus in the player when the video is clicked", async () => {
        const { player } = await setupWithNavigation();

        // Focusable, though not by Tab: clicks on the video land on it.
        expect(player.tabIndex).toBe(-1);
      });

      it("still closes on Escape pressed anywhere on the page", async () => {
        const onClose = vi.fn();
        const { container, controller } = mountHost(
          (host) => new PlayerController(host, { ...labels, onClose }),
          (player) => player.render(videoStory, { navigation: true }),
        );
        opened.push(controller);
        await controller.open();
        expect(container.querySelector("dialog")).not.toBeNull();

        press(document.body, "Escape");

        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    describe("step animation", () => {
      // jsdom has no layout nor Web Animations: widths and animate() are
      // stubbed.
      const FRAME = 405;
      const SIDE = 180;
      type Animate = (
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) => { cancel: () => void };
      let animate: Mock<Animate>;

      beforeEach(() => {
        animate = vi.fn<Animate>(() => ({ cancel: vi.fn() }));
        Object.assign(HTMLElement.prototype, { animate });
        vi.spyOn(
          HTMLElement.prototype,
          "offsetWidth",
          "get",
        ).mockImplementation(function (this: HTMLElement) {
          if (this.classList.contains("player-stage")) return FRAME;
          if (this.classList.contains("player-neighbor")) return SIDE;
          return 0;
        });
      });

      afterEach(() => {
        vi.restoreAllMocks();
        // @ts-expect-error removing the stubs jsdom doesn't have
        delete HTMLElement.prototype.animate;
      });

      // [element class, first keyframe, last keyframe, pseudo-element]
      const animations = () =>
        animate.mock.contexts.map((element, call) => {
          const [keyframes, options] = animate.mock.calls[call];
          return [
            (element as HTMLElement).className,
            keyframes[0],
            keyframes.at(-1),
            options.pseudoElement,
          ];
        });

      const near = FRAME / 2 + NEAR_GAP + SIDE / 2;
      const ratio = SIDE / FRAME;
      const cover = (x: number, scale = 1) =>
        `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;

      it("grows the video from the cover and slides the covers", async () => {
        const { controller, player } = await setupWithNavigation(true, {
          neighbors: [neighbor(-1), neighbor(1)],
        });
        await expand(player);

        await controller.showNext(1);

        expect(animations()).toEqual([
          ["player-dim", { opacity: 1 }, { opacity: 0 }, undefined],
          [
            "player-stage",
            { transform: `translateX(${near}px) scale(${ratio})` },
            { transform: "none" },
            undefined,
          ],
          // The previous video, shrinking to the cover before it.
          [
            "player-neighbor",
            { transform: cover(0, 1 / ratio) },
            { transform: cover(-near) },
            undefined,
          ],
          ["player-neighbor", { opacity: 0 }, { opacity: 1 }, "::after"],
          // The one two places after, sliding in to the next place.
          [
            "player-neighbor",
            { transform: cover(near + SIDE + FAR_GAP) },
            { transform: cover(near) },
            undefined,
          ],
        ]);
      });

      // Four Stories A B C D, A in the player: D, B and C beside it. Clicking
      // C (two before) leaves B, D and A beside it: each comes from where it
      // was, not from its offset plus the step.
      it("starts each cover where its Story was, across the wraparound", async () => {
        const [a, b, c, d] = ["a", "b", "c", "d"].map((name) => ({
          poster_url: `https://example.com/${name}.jpg`,
          media_url: `https://example.com/${name}.mp4`,
        }));
        let shown = {
          story: a,
          neighbors: [
            { offset: -1, story: d },
            { offset: 1, story: b },
            { offset: -2, story: c },
          ],
        };
        const { container, controller } = mountHost(
          (host) => new PlayerController(host, { ...labels, onClose: vi.fn() }),
          (player) =>
            player.render(shown.story, {
              navigation: true,
              neighbors: shown.neighbors,
            }),
        );
        opened.push(controller);
        await controller.open();
        const player = container.querySelector("dialog");
        if (!player) throw new Error("The player did not render");
        await expand(player);

        shown = {
          story: c,
          neighbors: [
            { offset: -1, story: b },
            { offset: 1, story: d },
            { offset: -2, story: a },
          ],
        };
        await controller.showNext(-2);

        const far = near + SIDE + FAR_GAP;
        expect(animations()).toEqual([
          ["player-dim", { opacity: 1 }, { opacity: 0 }, undefined],
          // C was the cover two before.
          [
            "player-stage",
            { transform: `translateX(${-far}px) scale(${ratio})` },
            { transform: "none" },
            undefined,
          ],
          // B was after A.
          [
            "player-neighbor",
            { transform: cover(near) },
            { transform: cover(-near) },
            undefined,
          ],
          // D was before A.
          [
            "player-neighbor",
            { transform: cover(-near) },
            { transform: cover(near) },
            undefined,
          ],
          // A was the video.
          [
            "player-neighbor",
            { transform: cover(0, 1 / ratio) },
            { transform: cover(-far) },
            undefined,
          ],
          ["player-neighbor", { opacity: 0 }, { opacity: 1 }, "::after"],
        ]);
      });

      it("swaps the video and the cover with two Stories", async () => {
        const { controller, player } = await setupWithNavigation(true, {
          neighbors: [neighbor(1)],
        });
        await expand(player);

        await controller.showNext(1);

        // --pair-dir is -1: the video ends left of center.
        expect(animations()).toEqual([
          ["player-dim", { opacity: 1 }, { opacity: 0 }, undefined],
          [
            "player-stage",
            {
              transform: `translateX(${-(FRAME + NEAR_GAP) / 2}px) scale(${ratio})`,
            },
            { transform: `translateX(${-(NEAR_GAP + SIDE) / 2}px)` },
            undefined,
          ],
          [
            "player-neighbor",
            { transform: cover((NEAR_GAP + SIDE) / 2, 1 / ratio) },
            { transform: cover((FRAME + NEAR_GAP) / 2) },
            undefined,
          ],
          ["player-neighbor", { opacity: 0 }, { opacity: 1 }, "::after"],
        ]);
      });

      // A transform makes an element the box its fixed descendants are
      // placed in: expand and close, fixed at the top right of the screen
      // when expanded, would jump into the video while it moves.
      it("keeps expand and close out of what moves", async () => {
        const { player } = await setupWithNavigation(true, {
          neighbors: [neighbor(1)],
        });
        await expand(player);
        const stage = player.querySelector(".player-stage");

        expect(stage?.contains(player.querySelector(".card"))).toBe(true);
        expect(stage?.contains(player.querySelector(".player-expand"))).toBe(
          false,
        );
        expect(stage?.contains(player.querySelector(".player-close"))).toBe(
          false,
        );
      });

      it("cancels a step still animating when the next one starts", async () => {
        const { controller, player } = await setupWithNavigation(true, {
          neighbors: [neighbor(-1), neighbor(1)],
        });
        await expand(player);

        await controller.showNext(1);
        const first = animate.mock.results.map((result) => result.value);
        await controller.showNext(1);

        for (const animation of first) {
          expect(animation.cancel).toHaveBeenCalledTimes(1);
        }
      });

      it("stops a step animation when collapsing or closing", async () => {
        const { controller, player } = await setupWithNavigation(true, {
          neighbors: [neighbor(-1), neighbor(1)],
        });
        await expand(player);
        await controller.showNext(1);
        const running = animate.mock.results.map((result) => result.value);

        player.querySelector<HTMLButtonElement>(".player-expand")?.click();
        await vi.waitFor(() => expect(shownAs(player)).toBe("popover"));

        for (const animation of running) {
          expect(animation.cancel).toHaveBeenCalledTimes(1);
        }

        await expand(player);
        await controller.showNext(1);
        const next = animate.mock.results
          .slice(running.length)
          .map((result) => result.value);
        controller.close();

        for (const animation of next) {
          expect(animation.cancel).toHaveBeenCalledTimes(1);
        }
      });

      it("does not animate the mini player", async () => {
        const { controller } = await setupWithNavigation(true, {
          neighbors: [neighbor(-1), neighbor(1)],
        });

        await controller.showNext(1);

        expect(animate).not.toHaveBeenCalled();
      });

      it("does not animate without covers on screen (narrow screens)", async () => {
        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(
          0,
        );
        const { controller, player } = await setupWithNavigation(true, {
          neighbors: [neighbor(-1), neighbor(1)],
        });
        await expand(player);

        await controller.showNext(1);

        expect(animate).not.toHaveBeenCalled();
      });

      it("does not animate with reduced motion", async () => {
        vi.stubGlobal("matchMedia", (query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
        }));
        try {
          const { controller, player } = await setupWithNavigation(true, {
            neighbors: [neighbor(-1), neighbor(1)],
          });
          await expand(player);

          await controller.showNext(1);

          expect(animate).not.toHaveBeenCalled();
        } finally {
          vi.unstubAllGlobals();
        }
      });
    });

    it("loops expanded with a single Story", async () => {
      const { player } = await setupWithNavigation(false);

      await expand(player);

      expect(player.querySelector("video")?.loop).toBe(true);
    });

    // Two Stories can share a video: the same src stays, and would go on
    // where the previous Story stopped.
    it("plays the next video from the start", async () => {
      const { controller, player } = await setupWithNavigation();
      const video = player.querySelector("video");
      if (video) video.currentTime = 7;

      await controller.showNext(1);

      expect(player.querySelector("video")).toBe(video);
      expect(video?.currentTime).toBe(0);
      expect(video?.paused).toBe(false);
    });

    it("keeps the sound on when the next Story gets a new video", async () => {
      const { controller, player } = await setupWithNavigation();
      const first = player.querySelector("video");
      if (first) first.muted = false;
      first?.dispatchEvent(new Event("volumechange"));
      // The video fails: the next Story gets a new one, created muted.
      first?.dispatchEvent(new Event("error"));
      await vi.waitFor(() => expect(player.querySelector("video")).toBeNull());

      await controller.showNext(1);

      const next = player.querySelector("video");
      expect(next).not.toBe(first);
      expect(next?.muted).toBe(false);
      expect(next?.paused).toBe(false);
    });

    it("plays the next video, even after the previous one failed", async () => {
      const { controller, player } = await setupWithNavigation();
      player.querySelector("video")?.dispatchEvent(new Event("error"));
      await vi.waitFor(() => expect(player.querySelector("video")).toBeNull());

      await controller.showNext();

      const video = player.querySelector("video");
      expect(video).not.toBeNull();
      expect(video?.paused).toBe(false);
    });
  });
});

describe("neighborOffsets", () => {
  it.each([
    [1, 0, []],
    [2, 0, [1]],
    [2, 1, [-1]],
    [3, 0, [-1, 1]],
    [4, 2, [-1, 1, -2]],
    [5, 0, [-1, 1, -2, 2]],
    [8, 3, [-1, 1, -2, 2]],
  ])("with %i Stories, the highlighted at %i: %j", (count, active, offsets) => {
    expect(neighborOffsets(count, active)).toEqual(offsets);
  });
});

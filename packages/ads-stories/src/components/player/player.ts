import { css, html, nothing } from "lit";
import type { StoryLabels } from "../../locales";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { icon } from "../icons";
import {
  hasVideo,
  prefersReducedMotion,
  renderMedia,
  VideoController,
} from "../media";
import { httpUrl } from "../../utils/safe-url";
import {
  renderCta,
  renderExpandableProduct,
  type CardCta,
  type CardProduct,
} from "../product";
import type { StoryMedia } from "../../types";

/**
 * Expanded view gaps, in pixels: between the video and the nearest covers,
 * and between covers. Shared by the CSS and the step animation.
 */
export const NEAR_GAP = 72;
export const FAR_GAP = 48;

// The player is a <dialog> shown in the top layer, so no store z-index,
// overflow or transform can hide or move it.
//
// Mini: a manual popover (non-modal, the page stays usable), with the card at
// the bottom right and the controls above it. Without popover support it is a
// non-modal dialog, fixed with a high z-index.
// Expanded: a modal dialog (showModal), so the browser makes the page behind
// it inert. The card is centered over a dark backdrop, with the controls at
// the top right of the screen. On narrow screens it fills the screen.
export const playerStyles = css`
  .player {
    position: fixed;
    inset: auto 16px 16px auto;
    z-index: 2147483000;
    box-sizing: border-box;
    width: calc(min(587px, 100vh - 80px) * 9 / 16);
    height: min(587px, 100vh - 80px);
    margin: 0;
    padding: 0;
    overflow: visible;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    animation: player-in 0.25s ease;
  }

  /* A <dialog> shown as a popover has no open attribute, which the browser
     hides by default. */
  .player:popover-open {
    display: block;
  }

  /* Switching modes shows the dialog again; only the first opening fades in. */
  .player[data-switched] {
    animation: none;
  }

  .player::backdrop {
    background: transparent;
  }

  /* Focusable only to keep the focus in the player when its video is clicked
     (see render): no ring around the whole player. */
  .player:focus {
    outline: none;
  }

  .player-frame {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* What moves in the expanded view, off center with two Stories and in the
     step animation: the video, its dimming and previous and next. Expand and
     close stay out of it: a transformed box becomes the one their fixed
     position, at the top right of the screen, is measured from. */
  .player-stage {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .player .card {
    width: 100%;
    height: 100%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  }

  .player .card:has(.video) {
    cursor: pointer;
  }

  /* Play/pause reuses the card's glass .play button, as a real button. */
  .player-toggle {
    padding: 0;
    border: 0;
    color: #fff;
    font: inherit;
    cursor: pointer;
  }

  .player[data-paused] .player-toggle,
  .player-toggle:focus-visible {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  /* On touch, tapping the video pauses it; the button shows while paused. */
  @media (hover: none) {
    .player:not([data-paused]) .player-toggle {
      opacity: 0;
    }
  }

  .player-sound {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    border-color: transparent;
    background: rgba(0, 0, 0, 0.3);
  }

  .player-sound .icon {
    width: 20px;
    height: 20px;
  }

  /* The product pill or the call to action. Their wrapper only stops clicks:
     the pill places itself. The product is larger than on the carousel card
     (as in the prototype). */
  .player-destination {
    display: contents;
  }

  .player .product-info {
    font-size: 14px;
  }

  .player .product-image {
    width: 72px;
    height: 72px;
  }

  .player .product-price {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Above the card: on narrow screens the expanded card can cover them. */
  .player-controls {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    z-index: 1;
    display: flex;
    gap: 8px;
  }

  /* Previous and next Story, above the card's top left (mini player only). */
  .player-nav {
    right: auto;
    left: 0;
  }

  .player-button {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(133, 133, 133, 0.3);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(5px);
    color: #fff;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .player-button:hover {
    background: rgba(0, 0, 0, 0.55);
  }

  .player-button .icon {
    width: 18px;
    height: 18px;
  }

  .player[data-expanded] {
    inset: 0;
    display: grid;
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    place-items: center;
    background: rgba(0, 0, 0, 0.85);
    animation: none;
  }

  .player[data-expanded] .player-frame {
    width: calc(min(78vh, 720px) * 9 / 16);
    height: min(78vh, 720px);
  }

  .player[data-expanded] .player-controls {
    position: fixed;
    top: 24px;
    right: 24px;
    bottom: auto;
  }

  .player[data-expanded] .player-button {
    width: 40px;
    height: 40px;
  }

  /* Expanded with more than one Story: the other Stories' covers beside the
     video, smaller and dimmed, as in the prototype. --side is -1 (before)
     or 1 (after), --beyond how many places past the nearest one. */
  .player[data-expanded] {
    --center-height: min(78vh, 720px);
    --side-height: min(38vh, 320px);
    --side-width: calc(var(--side-height) * 9 / 16);
    --center-half: calc(var(--center-height) * 9 / 32);
    --near-gap: ${NEAR_GAP}px;
    --far-gap: ${FAR_GAP}px;
    --near: calc(var(--center-half) + var(--near-gap) + var(--side-width) / 2);
    --pitch: calc(var(--side-width) + var(--far-gap));
  }

  .player-neighbor {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--side-width);
    height: var(--side-height);
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: var(--vtex-ads-story-radius, 16px);
    background: #111;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    cursor: pointer;
    transform: translate(
      calc(-50% + var(--side) * var(--near) + var(--beyond) * var(--pitch)),
      -50%
    );
  }

  .player-neighbor img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Fades out as the video arrives from a dimmed cover (see animateStep). */
  .player-dim {
    position: absolute;
    inset: 0;
    z-index: 3;
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: rgba(0, 0, 0, 0.35);
    opacity: 0;
    pointer-events: none;
  }

  .player-neighbor::after {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    content: "";
  }

  .player-neighbor:hover::after,
  .player-neighbor:focus-visible::after {
    background: rgba(0, 0, 0, 0.12);
  }

  .player-neighbor:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  /* Two Stories: the video moves off center toward --pair-dir, and the other
     Story sits on the other side. */
  .player[data-pair] .player-stage {
    transform: translateX(
      calc(var(--pair-dir) * (var(--near-gap) + var(--side-width)) / 2)
    );
  }

  .player[data-pair] .player-neighbor {
    transform: translate(
      calc(
        -50% + var(--pair-dir) * -1 * (var(--center-half) + var(--near-gap) / 2)
      ),
      -50%
    );
  }

  /* Expanded previous and next: beside the video, centered on its height. */
  .player[data-expanded] .player-nav {
    position: static;
    display: contents;
  }

  .player[data-expanded] .player-nav .player-button {
    position: absolute;
    top: 50%;
    z-index: 2;
    transform: translateY(-50%);
  }

  .player[data-expanded] .player-previous {
    left: -56px;
  }

  .player[data-expanded] .player-next {
    right: -56px;
  }

  /* With two, the other Story's cover beside the video does that. */
  .player[data-expanded][data-pair] .player-nav {
    display: none;
  }

  @media (max-width: 576px) {
    .player {
      right: 12px;
      width: 220px;
      height: 391px;
    }

    .player:not([data-expanded]) .product-image {
      width: 56px;
      height: 56px;
    }

    /* "Adicionar ao carrinho" fits on one line in the narrow mini player. */
    .player:not([data-expanded]) .product-action {
      height: 40px;
      padding: 0 8px;
      font-size: 12px;
    }

    .player[data-expanded] {
      background: #000;
    }

    /* The video stays 9:16 and centered; the rest of the screen is black. */
    .player[data-expanded] .player-frame {
      width: min(100vw, 100vh * 9 / 16);
      height: min(100vh, 100vw * 16 / 9);
    }

    .player[data-expanded] .card {
      border-radius: 0;
    }

    /* Below the sound button, at the top right of the video. Placed in the
       video frame, not the screen: the frame is centered, so on screens
       taller than 9:16 its top is below the screen's. */
    .player[data-expanded] .player-controls {
      position: absolute;
      top: 60px;
      right: 12px;
    }

    /* No room for the other Stories' covers: previous and next go inside
       the video's edges instead, also with two. */
    .player-neighbor {
      display: none;
    }

    .player[data-pair] .player-stage {
      transform: none;
    }

    .player[data-expanded][data-pair] .player-nav {
      display: contents;
    }

    .player[data-expanded] .player-previous {
      left: 12px;
    }

    .player[data-expanded] .player-next {
      right: 12px;
    }
  }

  @keyframes player-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .player {
      animation: none;
    }
  }
`;

export interface PlayerOptions {
  /**
   * Called by the previous (-1) and next (1) buttons, by another Story's
   * cover in the expanded view (its offset) and, in the expanded view, when
   * the video ends (1). Show the Story it
   * leads to with the next render(), then call showNext().
   */
  onStep?: (delta: number) => void;
  /**
   * Called by the close button, Escape and a click on the expanded view's
   * backdrop. Call close() from it.
   */
  onClose: () => void;
}

/** Another Story shown beside the expanded video. */
export interface PlayerNeighbor {
  /** Places from the Story in the player: negative before, positive after. */
  offset: number;
  story: StoryMedia;
  /**
   * Accessible name of its cover, telling it apart from the others (default
   * the `show` text).
   */
  label?: string;
}

export interface PlayerRenderOptions {
  labels: StoryLabels;
  /**
   * More than one Story: previous and next buttons and, in the expanded
   * view, the video moves on to the next Story when it ends.
   */
  navigation?: boolean;
  /** The other Stories beside the expanded video (see neighborOffsets). */
  neighbors?: readonly PlayerNeighbor[];
  /** The Story's product, shown at the bottom of the video. */
  product?: CardProduct;
  /** The Story's call to action, for a link destination (no product). */
  cta?: CardCta;
  /**
   * How many of the product were added from the element: above 0, its
   * stepper shows in place of add to cart.
   */
  cartQuantity?: number;
  /** Called by the product's add to cart and plus. The player stays open. */
  onAddToCart?: () => void;
  /** Called by the product's minus (a trash with one left). */
  onRemoveFromCart?: () => void;
  /**
   * Called by any click on the video's card (the video, its play and sound
   * buttons, the product and the call to action), before what that click
   * does. Not by previous and next, the window buttons or the covers beside
   * the video.
   */
  onPress?: () => void;
}

// What shows at the bottom of the video: one or the other.
type StoryDestination = Pick<
  PlayerRenderOptions,
  | "product"
  | "cta"
  | "labels"
  | "cartQuantity"
  | "onAddToCart"
  | "onRemoveFromCart"
>;

/**
 * Offsets of the Stories shown beside the expanded video, as in the
 * prototype: one with two Stories, on the side away from the edge the
 * highlighted one is on; otherwise the nearest ones, up to two per side, each
 * Story once.
 */
export function neighborOffsets(count: number, active: number): number[] {
  if (count < 2) return [];
  if (count === 2) return [active === 0 ? 1 : -1];

  const offsets: number[] = [];
  const shown = new Set([0]);
  for (const offset of [-1, 1, -2, 2]) {
    const index = ((offset % count) + count) % count;
    if (!shown.has(index)) {
      shown.add(index);
      offsets.push(offset);
    }
  }
  return offsets;
}

/** The prototype's expanded step: slow at the end, without bounce. */
export const STEP_ANIMATION: KeyframeAnimationOptions = {
  duration: 560,
  easing: "cubic-bezier(0.32, 0.72, 0, 1)",
};

/** Widths of the expanded view, in pixels, as rendered. */
interface StepSizes {
  frameWidth: number;
  sideWidth: number;
}

/** The Story in the player and the covers beside it, as rendered. */
interface ShownStories {
  story: StoryMedia;
  neighbors: readonly PlayerNeighbor[];
}

/** A cover beside the expanded video and its place (see PlayerNeighbor). */
interface RenderedNeighbor {
  element: HTMLElement;
  offset: number;
}

// Each cover is centered on the screen by translate(-50%, -50%), then moved.
const coverTransform = (x: number, scale = 1) =>
  `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;

const fadeIn = (element: HTMLElement) =>
  element.animate([{ opacity: 0 }, { opacity: 1 }], {
    ...STEP_ANIMATION,
    pseudoElement: "::after",
  });

/**
 * Three or more Stories: the video comes from `frameFrom`, the place of the
 * cover of the Story it now shows. Each cover comes from `from`, its Story's
 * place before the step; the one that was the video, from the middle, at the
 * video's size, its dimming fading in. The places match the CSS
 * (--near, --pitch).
 */
function animateRailStep(
  frame: HTMLElement,
  frameFrom: number,
  neighbors: readonly (RenderedNeighbor & { from: number })[],
  { frameWidth, sideWidth }: StepSizes,
): Animation[] {
  const placeX = (place: number) => {
    if (place === 0) return 0;
    const side = Math.sign(place);
    const near = frameWidth / 2 + NEAR_GAP + sideWidth / 2;
    return side * near + (place - side) * (sideWidth + FAR_GAP);
  };
  const ratio = sideWidth / frameWidth;

  const animations = [
    frame.animate(
      [
        { transform: `translateX(${placeX(frameFrom)}px) scale(${ratio})` },
        { transform: "none" },
      ],
      STEP_ANIMATION,
    ),
  ];

  for (const { element, offset, from } of neighbors) {
    const wasVideo = from === 0;

    animations.push(
      element.animate(
        [
          { transform: coverTransform(placeX(from), wasVideo ? 1 / ratio : 1) },
          { transform: coverTransform(placeX(offset)) },
        ],
        STEP_ANIMATION,
      ),
    );
    if (wasVideo) animations.push(fadeIn(element));
  }
  return animations;
}

/**
 * Two Stories: the video and the other cover swap sides. `direction` is the
 * side the video ends on (--pair-dir). The places match the CSS.
 */
function animatePairStep(
  frame: HTMLElement,
  neighbor: HTMLElement,
  direction: number,
  { frameWidth, sideWidth }: StepSizes,
): Animation[] {
  const videoX = (side: number) => (side * (NEAR_GAP + sideWidth)) / 2;
  const coverX = (side: number) => (-side * (frameWidth + NEAR_GAP)) / 2;
  const ratio = sideWidth / frameWidth;

  return [
    frame.animate(
      [
        { transform: `translateX(${coverX(-direction)}px) scale(${ratio})` },
        { transform: `translateX(${videoX(direction)}px)` },
      ],
      STEP_ANIMATION,
    ),
    neighbor.animate(
      [
        { transform: coverTransform(videoX(-direction), 1 / ratio) },
        { transform: coverTransform(coverX(direction)) },
      ],
      STEP_ANIMATION,
    ),
    fadeIn(neighbor),
  ];
}

/** The keys that step to the previous (-1) and next (1) Story. */
const ARROW_STEPS: Readonly<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

/**
 * Whether an arrow key press is free for the player: not already handled,
 * and without a modifier (Alt+Left goes back in the browser).
 */
const isFreeArrowKey = (event: KeyboardEvent) =>
  !event.defaultPrevented &&
  !event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey;

function supportsPopover(dialog: HTMLDialogElement) {
  return typeof dialog.showPopover === "function";
}

/**
 * The Story player, rendered by its host with render(). open() shows it as
 * the mini player; expand switches to the expanded view, a modal dialog, and
 * back. The video plays with the sound on when the player opens. It closes on
 * its own when the host leaves the page.
 */
export class PlayerController implements ReactiveController {
  readonly video: VideoController;

  /** Rendered and, once the host has updated, shown. */
  isOpen = false;
  private expanded = false;

  /** Open in the expanded view, a modal over the page. */
  get isExpanded() {
    return this.isOpen && this.expanded;
  }

  /** The card with the video, while the player is open. */
  get stageCard(): Element | undefined {
    return this.isOpen ? this.stageCardRef.value : undefined;
  }

  /** The product panel is open. Closed again on a step and on opening. */
  private productOpen = false;
  /** Switched modes at least once: only the first opening fades in. */
  private switched = false;
  /** The dialog is showing, in the mode `expanded` says. */
  private shown = false;

  private readonly dialog = createRef<HTMLDialogElement>();
  private readonly expandButton = createRef<HTMLButtonElement>();
  private readonly closeButton = createRef<HTMLButtonElement>();
  private readonly stage = createRef<HTMLElement>();
  private readonly stageCardRef = createRef<HTMLElement>();
  private readonly dim = createRef<HTMLElement>();

  /** The covers beside the expanded video, by offset, as rendered. */
  private readonly neighborElements = new Map<number, HTMLElement>();
  /** One ref callback per offset: a new one each render would detach it. */
  private readonly neighborRefs = new Map<
    number,
    (element?: Element) => void
  >();
  /** Rendered with previous and next (see PlayerRenderOptions). */
  private navigation = false;
  /** Side the expanded video moved to with two Stories; 0 otherwise. */
  private pairDirection = 0;
  /** The Story and covers rendered, and those before the last step. */
  private rendered?: ShownStories;
  private beforeStep?: ShownStories;
  /** The step animation running, cancelled by the next step. */
  private animations: Animation[] = [];

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: PlayerOptions,
  ) {
    host.addController(this);
    this.video = new VideoController(host);
  }

  hostDisconnected() {
    this.close();
  }

  /**
   * Opens the mini player, plays the video with the sound on (muted if the
   * browser blocks it) and focuses the close button.
   * With `productOpen`, the product panel shows open (the shopper chose the
   * product).
   */
  async open({ productOpen = false }: { productOpen?: boolean } = {}) {
    if (this.isOpen) return;

    document.addEventListener("keydown", this.onKeyDown);
    this.isOpen = true;
    this.expanded = false;
    this.productOpen = productOpen;
    this.switched = false;
    this.rendered = undefined;
    this.beforeStep = undefined;
    this.video.reset();
    this.host.requestUpdate();
    await this.host.updateComplete;

    const dialog = this.dialog.value;
    // Closed again before the host rendered it.
    if (!this.isOpen || !dialog) return;

    this.show(dialog);
    this.video.playWithSound();
    this.closeButton.value?.focus();
  }

  /** Hides the player now; the host removes it on its next update. */
  close() {
    if (!this.isOpen) return;

    document.removeEventListener("keydown", this.onKeyDown);
    this.cancelAnimations();
    const dialog = this.dialog.value;
    if (dialog) this.hide(dialog);
    this.isOpen = false;
    this.host.requestUpdate();
  }

  /**
   * After the host renders a different Story in the open player, `delta`
   * places from the previous one: its video starts from the top and plays,
   * with the sound as the shopper left it. A failed load of the previous
   * video doesn't hide the new one. The expanded view animates the step.
   */
  async showNext(delta = 0) {
    if (!this.isOpen) return;

    // Read before the render: a Story without a video, or a video that
    // failed, replaces the <video> with a new one, muted.
    const withSound = !this.video.muted;
    this.video.failed = false;
    this.video.retrying = false;
    // Another Story, another product: its panel starts closed.
    this.productOpen = false;
    this.host.requestUpdate();
    await this.host.updateComplete;
    if (!this.isOpen) return;

    this.video.restart({ withSound });
    this.animateStep(delta);
  }

  /** Stops a step animation still running, leaving the CSS layout. */
  private cancelAnimations() {
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
  }

  /**
   * The expanded step, as in the prototype: the video grows from the cover
   * of the Story it now shows, and the covers slide to their new places, the
   * previous Story's shrinking from the video's size. With two Stories, the
   * video and the other cover swap sides. Not with reduced motion, nor
   * without covers (narrow screens).
   */
  private animateStep(delta: number) {
    if (!this.expanded || delta === 0 || prefersReducedMotion()) return;

    const frame = this.stage.value;
    const dim = this.dim.value;
    if (!frame || !dim || typeof frame.animate !== "function") return;

    // Where each Story was before the step: the video (0), its cover's
    // offset, or, if it wasn't shown, `fallback`. Read from the Stories, not
    // from offset + delta: with wraparound (four Stories), a Story's offset
    // can change by more or less than the step.
    const { rendered, beforeStep } = this;
    const placeBefore = (story: StoryMedia | undefined, fallback: number) => {
      if (!story || !beforeStep) return fallback;
      if (story === beforeStep.story) return 0;
      const cover = beforeStep.neighbors.find((n) => n.story === story);
      return cover?.offset ?? fallback;
    };
    const neighbors = [...this.neighborElements].map(([offset, element]) => ({
      offset,
      element,
      from: placeBefore(
        rendered?.neighbors.find((n) => n.offset === offset)?.story,
        offset + delta,
      ),
    }));

    const sizes = {
      frameWidth: frame.offsetWidth,
      sideWidth: neighbors[0]?.element.offsetWidth ?? 0,
    };
    if (!sizes.frameWidth || !sizes.sideWidth) return;

    this.cancelAnimations();
    this.animations = [
      dim.animate([{ opacity: 1 }, { opacity: 0 }], STEP_ANIMATION),
      ...(this.pairDirection
        ? animatePairStep(
            frame,
            neighbors[0].element,
            this.pairDirection,
            sizes,
          )
        : animateRailStep(
            frame,
            placeBefore(rendered?.story, delta),
            neighbors,
            sizes,
          )),
    ];
  }

  // Keeps neighborElements in step with the covers Lit renders.
  private neighborRef(offset: number) {
    let callback = this.neighborRefs.get(offset);
    if (!callback) {
      callback = (element?: Element) => {
        if (element) this.neighborElements.set(offset, element as HTMLElement);
        else this.neighborElements.delete(offset);
      };
      this.neighborRefs.set(offset, callback);
    }
    return callback;
  }

  // Mini: a manual popover, or a non-modal dialog without popover support.
  // Expanded: a modal dialog.
  // Already showing: a second expand click in the same task resumes after the
  // first one has shown the dialog, and showing it again would throw.
  private show(dialog: HTMLDialogElement) {
    if (this.shown) return;
    if (this.expanded) dialog.showModal();
    else if (supportsPopover(dialog)) dialog.showPopover();
    else dialog.show();
    this.shown = true;
  }

  // A dialog can't be shown as a popover and as a modal at the same time, so
  // switching modes hides it first, the same way it was shown.
  private hide(dialog: HTMLDialogElement) {
    if (!this.shown) return;
    if (!this.expanded && supportsPopover(dialog)) dialog.hidePopover();
    else dialog.close();
    this.shown = false;
  }

  private readonly toggleExpanded = async () => {
    const dialog = this.dialog.value;
    if (!dialog) return;

    // A step animation would go on moving the video in the other mode.
    this.cancelAnimations();
    this.hide(dialog);
    this.expanded = !this.expanded;
    this.switched = true;
    this.host.requestUpdate();
    await this.host.updateComplete;

    if (!this.isOpen) return;
    this.show(dialog);
    this.expandButton.value?.focus();
  };

  // Escape anywhere on the page, also in the mini player, which is not modal.
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.options.onClose();
  };

  // With the focus in the player and more than one Story, the arrows step, as
  // the previous and next buttons do. Only there: the mini player leaves the
  // page usable, and the page's own arrow keys (a gallery, a slider) keep
  // working.
  private readonly onPlayerKeyDown = (event: KeyboardEvent) => {
    const delta = ARROW_STEPS[event.key];
    if (!delta || !this.navigation || !isFreeArrowKey(event)) return;

    // The arrow would also scroll the page.
    event.preventDefault();
    this.options.onStep?.(delta);
  };

  // Clicks on the backdrop of the expanded view reach the dialog itself.
  private readonly onDialogClick = (event: Event) => {
    if (this.expanded && event.target === event.currentTarget) {
      this.options.onClose();
    }
  };

  // Escape on a modal dialog would only hide it: close the player instead.
  private readonly onCancel = (event: Event) => {
    event.preventDefault();
    this.options.onClose();
  };

  /**
   * Play/pause in the middle of the video and sound on/off at its top right.
   * They follow the video's own events, so a blocked autoplay shows as
   * paused.
   */
  private readonly toggleProduct = () => {
    this.productOpen = !this.productOpen;
    this.host.requestUpdate();
  };

  /**
   * Loads the failed video again and, once it loads, plays it with the sound
   * on (muted if the browser blocks it). Not if the player closed or moved to
   * another Story meanwhile.
   */
  private readonly retryVideo = async (event?: Event) => {
    event?.stopPropagation();
    this.dialog.value?.focus();
    const story = this.rendered?.story;
    const loaded = await this.video.retry();
    if (loaded && this.isOpen && this.rendered?.story === story) {
      this.video.playWithSound();
    }
  };

  /**
   * A click on the video: closes the product panel when it is open, plays or
   * pauses the video otherwise.
   */
  private readonly onVideoClick = () => {
    if (this.productOpen) this.toggleProduct();
    else this.video.togglePlayback();
  };

  /**
   * At the bottom of the video, the product pill, which opens the panel with
   * its actions, or the call to action of a link destination. Clicks on them
   * don't reach the video.
   */
  private renderDestination({ product, cta, ...cart }: StoryDestination) {
    let content;
    if (product) {
      content = renderExpandableProduct(product, {
        ...cart,
        open: this.productOpen,
        onToggle: this.toggleProduct,
        panelId: "player-product-panel",
      });
    } else if (cta) {
      content = renderCta(cta);
    } else {
      return nothing;
    }

    return html`
      <div
        class="player-destination"
        @click=${(event: Event) => event.stopPropagation()}
      >
        ${content}
      </div>
    `;
  }

  private renderVideoControls(labels: StoryLabels) {
    const { video } = this;

    // Not a .player-button: it keeps the card's larger glass look.
    const onToggle = (event: Event) => {
      event.stopPropagation();
      video.togglePlayback();
    };
    const onSound = (event: Event) => {
      event.stopPropagation();
      video.toggleMuted();
    };

    return html`
      <button
        type="button"
        class="play player-toggle"
        aria-label=${video.paused ? labels.play : labels.pause}
        @click=${onToggle}
      >
        ${icon(video.paused ? "play" : "pause")}
      </button>
      <button
        type="button"
        class="player-button player-sound"
        aria-label=${video.muted ? labels.soundOn : labels.soundOff}
        @click=${onSound}
      >
        ${icon(video.muted ? "soundOff" : "soundOn")}
      </button>
    `;
  }

  /**
   * Previous and next Story: above the mini player's top left, beside the
   * expanded video.
   */
  private renderNavigation(labels: StoryLabels) {
    const { options } = this;
    const step = (delta: number) => () => options.onStep?.(delta);

    return html`
      <div class="player-controls player-nav">
        <button
          type="button"
          class="player-button player-previous"
          aria-label=${labels.previous}
          @click=${step(-1)}
        >
          ${icon("previous")}
        </button>
        <button
          type="button"
          class="player-button player-next"
          aria-label=${labels.next}
          @click=${step(1)}
        >
          ${icon("next")}
        </button>
      </div>
    `;
  }

  /** The other Stories' covers beside the expanded video. */
  private renderNeighbors(
    neighbors: readonly PlayerNeighbor[],
    labels: StoryLabels,
  ) {
    const { options } = this;

    // With two Stories, the single cover's offset flips between 1 and -1 on
    // each step: a stable key keeps its button, and the focus on it.
    return repeat(
      neighbors,
      ({ offset }) => (neighbors.length === 1 ? "single" : offset),
      ({ offset, story, label }) => {
        const poster = httpUrl(story.poster_url);
        const side = Math.sign(offset);
        return html`
          <button
            type="button"
            class="player-neighbor"
            aria-label=${label ?? labels.show}
            style=${styleMap({
              "--side": String(side),
              "--beyond": String(offset - side),
            })}
            ${ref(this.neighborRef(offset))}
            @click=${() => options.onStep?.(offset)}
          >
            ${poster ? html`<img alt="" src=${poster} />` : nothing}
          </button>
        `;
      },
    );
  }

  /** Expand or collapse, and close: above the video, or at the top right. */
  private renderWindowControls(labels: StoryLabels) {
    const { options, expanded } = this;

    return html`
      <div class="player-controls">
        <button
          type="button"
          class="player-button player-expand"
          aria-label=${expanded ? labels.collapse : labels.expand}
          ${ref(this.expandButton)}
          @click=${this.toggleExpanded}
        >
          ${icon(expanded ? "collapse" : "expand")}
        </button>
        <button
          type="button"
          class="player-button player-close"
          aria-label=${labels.close}
          ${ref(this.closeButton)}
          @click=${options.onClose}
        >
          ${icon("close")}
        </button>
      </div>
    `;
  }

  /**
   * The video with its controls and the product or call to action. With
   * `advances`, it plays once and moves on to the next Story when it ends;
   * otherwise it loops.
   */
  private renderVideo(
    story: StoryMedia,
    advances: boolean,
    destination: StoryDestination,
  ) {
    const { video, options } = this;

    return html`
      <div class="card" ${ref(this.stageCardRef)} @click=${this.onVideoClick}>
        ${renderMedia(story, video, {
          loop: !advances,
          onEnded: advances ? () => options.onStep?.(1) : undefined,
          labels: destination.labels,
          onRetry: this.retryVideo,
        })}
        ${hasVideo(story, video)
          ? this.renderVideoControls(destination.labels)
          : nothing}
        ${this.renderDestination(destination)}
      </div>
    `;
  }

  /**
   * Keeps what this render shows, for the step animation: the covers beside
   * the video (only in the expanded view) and the side the video moves to
   * with two Stories. A new Story makes what was shown the animation's
   * start.
   */
  private track(story: StoryMedia, neighbors: readonly PlayerNeighbor[]) {
    const shown = this.expanded ? neighbors : [];
    this.pairDirection = shown.length === 1 ? -Math.sign(shown[0].offset) : 0;

    if (this.rendered && story !== this.rendered.story) {
      this.beforeStep = this.rendered;
    }
    this.rendered = { story, neighbors: shown };
    return shown;
  }

  /**
   * The player <dialog> while it is open. Clicking the video also plays or
   * pauses it, and keeps the focus in the player (the dialog is focusable,
   * though not by Tab), so the arrow keys still step. With `navigation`
   * (more than one Story), it has previous and next buttons and arrow keys,
   * and the expanded view moves on when the video ends instead of looping.
   * The expanded view also shows the `neighbors` beside it.
   */
  render(
    story: StoryMedia,
    {
      navigation = false,
      neighbors = [],
      onPress,
      ...destination
    }: PlayerRenderOptions,
  ) {
    const { labels } = destination;
    if (!this.isOpen) return nothing;

    const { video, expanded } = this;
    const shownNeighbors = this.track(story, neighbors);
    const pair = this.pairDirection !== 0;
    this.navigation = navigation;

    return html`
      <dialog
        class="player"
        popover="manual"
        aria-label=${labels.player}
        ?data-expanded=${expanded}
        ?data-pair=${pair}
        style=${styleMap({
          "--pair-dir": pair ? String(this.pairDirection) : undefined,
        })}
        ?data-switched=${this.switched}
        ?data-paused=${hasVideo(story, video) && video.paused}
        tabindex="-1"
        ${ref(this.dialog)}
        @click=${this.onDialogClick}
        @cancel=${this.onCancel}
        @keydown=${this.onPlayerKeyDown}
      >
        ${this.renderNeighbors(shownNeighbors, labels)}
        <div class="player-frame">
          ${this.renderWindowControls(labels)}
          <div
            class="player-stage"
            ${ref(this.stage)}
            @click=${{
              handleEvent: (event: Event) => {
                const card = this.stageCardRef.value;
                if (card?.contains(event.target as Node)) onPress?.();
              },
              capture: true,
            }}
          >
            ${navigation ? this.renderNavigation(labels) : nothing}
            ${this.renderVideo(story, navigation && expanded, destination)}
            <span class="player-dim" aria-hidden="true" ${ref(this.dim)}></span>
          </div>
        </div>
      </dialog>
    `;
  }
}

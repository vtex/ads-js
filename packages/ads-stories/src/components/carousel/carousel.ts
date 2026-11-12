import {
  css,
  html,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from "lit";
import type { StoryLabels } from "../../locales";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { icon } from "../icons";

export const STAGE_HEIGHT = css`500px`;
const SOLO_PADDING = css`24px`;

/** Time each Story stays highlighted before the next one, in milliseconds. */
export const AUTO_ADVANCE_MS = 5000;

/** How far a pointer must move, in pixels, to count as a swipe. */
export const SWIPE_DISTANCE = 40;

/** Screens this narrow have no room for two cards side by side. */
export const NARROW_SCREEN = css`(max-width: 576px)`;

/**
 * Rolling layout: cards on each side of the highlighted one. Up to
 * VISIBLE_SIDE show on each side; RENDERED_SIDE are kept in the DOM, the
 * farther ones hidden, so a card slides in from its place instead of
 * appearing.
 */
export const VISIBLE_SIDE = 2;
export const RENDERED_SIDE = VISIBLE_SIDE + 3;

/**
 * How the cards are laid out:
 * - solo: one Story, the card centered over the background.
 * - pair: two Stories side by side; moving only changes the highlight.
 * - rolling: the highlighted card in the middle, the others on each side,
 *   all moving one place per step. Three or more Stories, or two on narrow
 *   screens.
 */
export type CarouselLayout = "solo" | "pair" | "rolling";

/**
 * The carousel stage: a band as tall as the card, as wide as the element's
 * parent. The store sets the width on its own container.
 *
 * Solo: the card sits centered over a solid background with room around it:
 * the card shrinks to fit the padding and gets a soft shadow. On narrow
 * screens (576px or less) there is no room for it: the card shows alone at
 * full height.
 *
 * Pair and rolling: the highlighted card is full size, the others smaller
 * (0.9) and dimmed.
 */
export const carouselStyles = css`
  .carousel {
    position: relative;
    box-sizing: border-box;
    display: grid;
    height: ${STAGE_HEIGHT};
    place-items: center;
    --card-height: ${STAGE_HEIGHT};
    user-select: none;
  }

  .carousel[data-layout="solo"] {
    padding: ${SOLO_PADDING};
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: var(--vtex-ads-story-color-surface, #fafafa);
    --card-height: calc(${STAGE_HEIGHT} - 2 * ${SOLO_PADDING});
  }

  .carousel[data-layout="solo"] .card {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .track {
    position: absolute;
    inset: 0;
    overflow: hidden;
    touch-action: pan-y;
  }

  /* Each slide starts centered, then moves by its own transform. */
  .slide {
    --ease: cubic-bezier(0.25, 1, 0.5, 1);
    --duration: var(--slide-duration, 0.4s);
    position: absolute;
    top: 0;
    left: 50%;
    width: calc(${STAGE_HEIGHT} * 9 / 16);
    height: 100%;
    margin-left: calc(${STAGE_HEIGHT} * 9 / -32);
    opacity: 0.5;
    transition:
      transform var(--duration) var(--ease),
      opacity var(--duration) var(--ease),
      visibility 0s;
  }

  .slide[data-active] {
    opacity: 1;
  }

  /* Pair: --side is -1 for the first card, 1 for the second. The highlighted
     card sits 47.5% of its width off center, the other (scaled to 0.9)
     52.5%, so the gap between them stays 8px. */
  .carousel[data-layout="pair"] .slide {
    --side: 1;
    --offset: 52.5%;
    --scale: 0.9;
    transform: translateX(calc(var(--side) * (var(--offset) + 4px)))
      scale(var(--scale));
  }

  .carousel[data-layout="pair"] .slide[data-index="0"] {
    --side: -1;
  }

  .carousel[data-layout="pair"] .slide[data-active] {
    --offset: 47.5%;
    --scale: 1;
  }

  /* Rolling: --place is the slide's distance from the highlighted one, in
     cards, 8px apart. A hidden slide fades out, then stops being visible. */
  .carousel[data-layout="rolling"] .slide {
    transform: translateX(calc(var(--place) * (100% + 8px))) scale(0.9);
  }

  .carousel[data-layout="rolling"] .slide[data-active] {
    transform: translateX(0) scale(1);
  }

  .slide[data-hidden] {
    opacity: 0;
    visibility: hidden;
    transition:
      transform var(--duration) var(--ease),
      opacity var(--duration) var(--ease),
      visibility 0s var(--duration);
  }

  /* Only the highlighted card opens the player, so only it shows play. Its
     sound is the only one to turn on: the others play muted, if at all. */
  .slide:not([data-active]) .play,
  .slide:not([data-active]) .card-sound {
    display: none;
  }

  .arrow {
    position: absolute;
    top: 50%;
    z-index: 2;
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(133, 133, 133, 0.3);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    color: #fff;
    cursor: pointer;
    transform: translateY(-50%);
    transition: background-color 0.2s;
  }

  .arrow:hover {
    background: #262626;
  }

  .arrow:disabled {
    cursor: default;
    opacity: 0.5;
  }

  .arrow .icon {
    width: 16px;
    height: 16px;
  }

  .arrow-previous {
    left: 3px;
  }

  .arrow-next {
    right: 3px;
  }

  @media ${NARROW_SCREEN} {
    .carousel[data-layout="solo"] {
      padding: 0;
      background: none;
      --card-height: ${STAGE_HEIGHT};
    }

    .carousel[data-layout="solo"] .card {
      box-shadow: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slide,
    .slide[data-hidden] {
      transition: none;
    }
  }
`;

export interface CarouselOptions {
  /**
   * Called when the highlight moves, before the host renders it, with the
   * keys (see Slide) of the slide that loses it and the one that gets it.
   * The host's updateComplete then resolves once the step is rendered.
   */
  onStep?: (from: number, to: number) => void;
  /**
   * Called when the layout changes (the screen got narrow or wide): every
   * slide is new, with new keys.
   */
  onLayoutChange?: () => void;
  /**
   * While true, the highlight doesn't move, by hand or on its own (for
   * example, while the player shows the highlighted Story).
   */
  locked?: () => boolean;
}

/** One rendered card. */
export interface Slide {
  /**
   * Stays with the card while it moves, so state kept per card (such as its
   * video) follows it. Unique among the rendered slides of a layout; the
   * same Story can show in more than one slide.
   */
  key: number;
  /** The Story's index in the list. */
  index: number;
  /** Places from the highlighted card: negative before it, positive after. */
  offset: number;
  /** Has the highlight. */
  active: boolean;
  /** Kept in the DOM out of sight, so it can slide in. */
  hidden: boolean;
  /**
   * Pass to the card's element (renderCard's ref): the carousel then knows
   * where each Story's card is (see visibleCards).
   */
  cardRef: (element?: Element) => void;
  /**
   * Pass to the card's element that takes the keyboard focus (renderCard's
   * openRef; see focusActive).
   */
  focusRef: (element?: Element) => void;
}

/** Renders the card of one Story. */
export type RenderSlide<T> = (item: T, slide: Slide) => TemplateResult;

const wrap = (value: number, count: number) =>
  ((value % count) + count) % count;

// A ref callback that keeps `elements` up to date. Each render passes new
// callbacks: lit calls the last render's with undefined, then the new one
// with the element, so an element dropped by the rolling layout or the host
// leaving the page leaves `elements`.
function tracker(elements: Map<Element, Slide>, slide: Slide) {
  let last: Element | undefined;
  return (element?: Element) => {
    if (last) elements.delete(last);
    last = element;
    if (element) elements.set(element, slide);
  };
}

/**
 * The carousel around the Story cards: which Story has the highlight, the
 * layout, the arrows, swipes and the automatic advance. Call reset() when
 * the Stories change, and render() from the host's render.
 *
 * The highlight moves on its own every AUTO_ADVANCE_MS, except while the
 * pointer is over the carousel, the keyboard focus is in it, it is locked,
 * or the host is off the page.
 */
export class CarouselController implements ReactiveController {
  /**
   * Steps taken since the Stories loaded, back and forth, not wrapped: the
   * rolling layout keys its slides by it.
   */
  private position = 0;
  /** Stories moved by the last step: longer jumps animate a bit slower. */
  private distance = 1;
  private count = 0;
  private narrow = false;
  private media?: MediaQueryList;
  private connected = false;
  private hovered = false;
  private focused = false;
  private timer?: ReturnType<typeof setInterval>;
  private swipe?: { x: number; moved: boolean };
  /** The rendered cards, as their cardRef reported them. */
  private readonly cards = new Map<Element, Slide>();
  /** The rendered cards' focus targets, as their focusRef reported them. */
  private readonly focusTargets = new Map<Element, Slide>();

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: CarouselOptions,
  ) {
    host.addController(this);
  }

  /** Index of the highlighted Story. */
  get active() {
    return this.count ? wrap(this.position, this.count) : 0;
  }

  get layout(): CarouselLayout {
    if (this.count < 2) return "solo";
    return this.count === 2 && !this.narrow ? "pair" : "rolling";
  }

  /** Key (see Slide) of the highlighted slide. */
  get activeKey() {
    if (this.layout === "rolling") return this.position;
    return this.active;
  }

  /**
   * The cards on screen, with their slide: not the hidden ones kept for the
   * slide in.
   */
  *visibleCards(): Generator<readonly [card: Element, slide: Slide]> {
    for (const [card, slide] of this.cards) {
      if (!slide.hidden) yield [card, slide];
    }
  }

  /** Moves the keyboard focus to the highlighted card, once rendered. */
  focusActive() {
    for (const [target, slide] of this.focusTargets) {
      if (slide.active && target instanceof HTMLElement) {
        target.focus();
        return;
      }
    }
  }

  hostConnected() {
    this.connected = true;
    this.media = globalThis.matchMedia?.(NARROW_SCREEN.toString());
    this.media?.addEventListener("change", this.onMediaChange);
    this.narrow = this.media?.matches ?? false;
    this.syncTimer();
  }

  hostDisconnected() {
    this.connected = false;
    this.media?.removeEventListener("change", this.onMediaChange);
    this.media = undefined;
    this.endSwipe();
    this.syncTimer();
  }

  // Whatever the host changed (the player opening, new Stories) may start or
  // stop the automatic advance.
  hostUpdated() {
    this.syncTimer();
  }

  /** For a new list of Stories: the first one gets the highlight. */
  reset(count: number) {
    this.count = count;
    this.position = 0;
    this.distance = 1;
    // The carousel may leave the page now (the element renders nothing while
    // it loads). Removing the element with the pointer or focus doesn't fire
    // pointerleave or focusout, and the new one would never advance.
    this.hovered = false;
    this.focused = false;
    this.restartTimer();
  }

  /**
   * Moves the highlight by `delta` Stories, wrapping around the ends. While
   * locked, only with `evenIfLocked` (for example, the player stepping to
   * the next Story it shows).
   */
  step(delta: number, { evenIfLocked = false } = {}) {
    if (this.count < 2 || delta === 0) return;
    if (this.options.locked?.() && !evenIfLocked) return;

    const from = this.activeKey;
    this.position += delta;
    this.distance = Math.abs(delta);

    // The update is requested first, so onStep can wait for the render that
    // shows the step (the host's updateComplete).
    this.host.requestUpdate();
    this.options.onStep?.(from, this.activeKey);
    // A step by hand gives the new Story its full time.
    this.restartTimer();
  }

  private get shouldAdvance() {
    return (
      this.connected &&
      this.count > 1 &&
      !this.hovered &&
      !this.focused &&
      !this.options.locked?.()
    );
  }

  private syncTimer() {
    if (this.shouldAdvance && !this.timer) {
      this.timer = setInterval(() => this.step(1), AUTO_ADVANCE_MS);
    } else if (!this.shouldAdvance && this.timer) {
      this.stopTimer();
    }
  }

  private stopTimer() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private restartTimer() {
    this.stopTimer();
    this.syncTimer();
  }

  private readonly onMediaChange = (event: MediaQueryListEvent) => {
    const layout = this.layout;
    this.narrow = event.matches;
    if (this.layout === layout) return;

    this.options.onLayoutChange?.();
    this.host.requestUpdate();
  };

  private readonly onPointerEnter = () => {
    this.hovered = true;
    this.syncTimer();
  };

  private readonly onPointerLeave = () => {
    this.hovered = false;
    this.syncTimer();
  };

  // Only keyboard focus stops the advance: a click also focuses the button
  // it hits, and the advance would then stay stopped after the pointer left.
  private readonly onFocusIn = (event: FocusEvent) => {
    this.focused = (event.target as Element).matches(":focus-visible");
    this.syncTimer();
  };

  private readonly onFocusOut = (event: FocusEvent) => {
    const carousel = event.currentTarget as Element;
    const next = event.relatedTarget as Node | null;
    if (!next || !carousel.contains(next)) this.focused = false;
    this.syncTimer();
  };

  // The release is listened for on the window: a mouse drag can end over an
  // arrow or off the carousel, where the track never gets the pointerup.
  private readonly onPointerDown = (event: PointerEvent) => {
    this.endSwipe();
    this.swipe = { x: event.clientX, moved: false };
    globalThis.addEventListener("pointerup", this.onPointerUp);
    globalThis.addEventListener("pointercancel", this.onPointerCancel);
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    const { swipe } = this;
    this.removeSwipeListeners();
    if (!swipe) return;

    const distance = event.clientX - swipe.x;
    if (Math.abs(distance) > SWIPE_DISTANCE) {
      swipe.moved = true;
      this.step(distance < 0 ? 1 : -1);
    }
  };

  private readonly onPointerCancel = () => this.endSwipe();

  private endSwipe() {
    this.removeSwipeListeners();
    this.swipe = undefined;
  }

  private removeSwipeListeners() {
    globalThis.removeEventListener("pointerup", this.onPointerUp);
    globalThis.removeEventListener("pointercancel", this.onPointerCancel);
  }

  // A swipe ends with a click on the card under the pointer: it must not
  // open the player or select that card.
  private readonly onClickCapture = {
    handleEvent: (event: Event) => {
      if (this.swipe?.moved) {
        event.stopPropagation();
        event.preventDefault();
      }
      this.swipe = undefined;
    },
    capture: true,
  };

  private slide(fields: Omit<Slide, "cardRef" | "focusRef">): Slide {
    const slide: Slide = {
      ...fields,
      cardRef: (element) => track(element),
      focusRef: (element) => trackFocus(element),
    };
    const track = tracker(this.cards, slide);
    const trackFocus = tracker(this.focusTargets, slide);
    return slide;
  }

  /** Pair: both Stories, each keyed by its index. */
  private pairSlides(): Slide[] {
    const { active } = this;
    return [0, 1].map((index) =>
      this.slide({
        key: index,
        index,
        offset: index - active,
        active: index === active,
        hidden: false,
      }),
    );
  }

  /**
   * Rolling: the slides around the highlighted one, keyed by their position.
   * Up to VISIBLE_SIDE show on each side, fewer when there aren't enough
   * Stories to fill both sides without repeating: half on each side, the
   * extra one after it. With four, the Story opposite the highlighted one
   * shows at both ends; with two (narrow screens), the other one shows on
   * both sides.
   */
  private rollingSlides(): Slide[] {
    const { count } = this;
    const even = count === 2 || count === 4;
    const before = even ? count / 2 : Math.floor((count - 1) / 2);
    const after = even ? count / 2 : count - 1 - before;

    const slides: Slide[] = [];
    for (let offset = -RENDERED_SIDE; offset <= RENDERED_SIDE; offset += 1) {
      slides.push(
        this.slide({
          key: this.position + offset,
          index: wrap(this.position + offset, count),
          offset,
          active: offset === 0,
          hidden:
            Math.abs(offset) > VISIBLE_SIDE ||
            offset < -before ||
            offset > after,
        }),
      );
    }
    return slides;
  }

  private renderSlides<T>(items: readonly T[], renderSlide: RenderSlide<T>) {
    const { layout } = this;
    const slides = layout === "pair" ? this.pairSlides() : this.rollingSlides();

    // The layout is part of the key: the same key in another layout is a new
    // card, with a new video and controller (see onLayoutChange).
    return repeat(
      slides,
      (slide) => `${layout}:${slide.key}`,
      (slide) => {
        const { index } = slide;
        return html`
          <div
            class="slide"
            data-index=${index}
            ?data-active=${slide.active}
            ?data-hidden=${slide.hidden}
            ?inert=${slide.hidden}
            style=${styleMap({ "--place": String(slide.offset) })}
          >
            ${renderSlide(items[index], slide)}
          </div>
        `;
      },
    );
  }

  /**
   * One item: the card centered over the background. More: the cards in the
   * pair or rolling layout, with the arrows.
   */
  render<T>(
    items: readonly T[],
    renderSlide: RenderSlide<T>,
    labels: StoryLabels,
  ) {
    if (this.layout === "solo") {
      return html`
        <div class="carousel" data-layout="solo">
          ${renderSlide(
            items[0],
            this.slide({
              key: 0,
              index: 0,
              offset: 0,
              active: true,
              hidden: false,
            }),
          )}
        </div>
      `;
    }

    const locked = this.options.locked?.() ?? false;

    return html`
      <div
        class="carousel"
        data-layout=${this.layout}
        role="region"
        aria-roledescription=${labels.carouselRole}
        aria-label=${labels.carousel}
        @pointerenter=${this.onPointerEnter}
        @pointerleave=${this.onPointerLeave}
        @focusin=${this.onFocusIn}
        @focusout=${this.onFocusOut}
      >
        <div
          class="track"
          style=${styleMap({
            "--slide-duration": this.distance > 1 ? "0.52s" : "0.4s",
          })}
          @pointerdown=${this.onPointerDown}
          @click=${this.onClickCapture}
        >
          ${this.renderSlides(items, renderSlide)}
        </div>
        <button
          type="button"
          class="arrow arrow-previous"
          aria-label=${labels.previous}
          ?disabled=${locked}
          @click=${() => this.step(-1)}
        >
          ${icon("previous")}
        </button>
        <button
          type="button"
          class="arrow arrow-next"
          aria-label=${labels.next}
          ?disabled=${locked}
          @click=${() => this.step(1)}
        >
          ${icon("next")}
        </button>
      </div>
    `;
  }
}

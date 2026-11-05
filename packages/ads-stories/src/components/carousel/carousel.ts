import {
  css,
  html,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from "lit";
import { icon } from "../icons";

const STAGE_HEIGHT = css`500px`;
const SOLO_PADDING = css`24px`;

/** Time each Story stays highlighted before the next one, in milliseconds. */
export const AUTO_ADVANCE_MS = 5000;

/** How far a pointer must move, in pixels, to count as a swipe. */
export const SWIPE_DISTANCE = 40;

/**
 * The carousel stage: a band as tall as the card, as wide as the element's
 * parent. The store sets the width on its own container.
 *
 * One Story: the card sits centered over a solid background
 * (--vtex-ads-story-solo-background, default #fafafa), with room around it:
 * the card shrinks to fit the padding and gets a soft shadow.
 *
 * Two Stories: both cards side by side, centered. Moving only changes the
 * highlight: the highlighted card is full size, the other smaller and dimmed.
 *
 * On narrow screens (576px or less) there is no room
 * for either: one Story shows alone at full height, and with two, the
 * highlighted card is centered with the other peeking at its side.
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

  .carousel[data-solo] {
    padding: ${SOLO_PADDING};
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: var(--vtex-ads-story-solo-background, #fafafa);
    --card-height: calc(${STAGE_HEIGHT} - 2 * ${SOLO_PADDING});
  }

  .carousel[data-solo] .card {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .track {
    position: absolute;
    inset: 0;
    overflow: hidden;
    touch-action: pan-y;
  }

  /* Each slide starts centered, then moves to its side: --side is -1 for the
     first card, 1 for the second. The highlighted card sits 47.5% of its
     width off center, the other (scaled to 0.9) 52.5%, so the gap between
     them stays 8px. */
  .slide {
    --side: 1;
    --offset: 52.5%;
    --scale: 0.9;
    --ease: cubic-bezier(0.25, 1, 0.5, 1);
    position: absolute;
    top: 0;
    left: 50%;
    width: calc(${STAGE_HEIGHT} * 9 / 16);
    height: 100%;
    margin-left: calc(${STAGE_HEIGHT} * 9 / -32);
    opacity: 0.5;
    transform: translateX(calc(var(--side) * (var(--offset) + 4px)))
      scale(var(--scale));
    transition:
      transform 0.4s var(--ease),
      opacity 0.4s var(--ease);
  }

  .slide[data-index="0"] {
    --side: -1;
  }

  .slide[data-active] {
    --offset: 47.5%;
    --scale: 1;
    opacity: 1;
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

  @media (max-width: 576px) {
    .carousel[data-solo] {
      padding: 0;
      background: none;
      --card-height: ${STAGE_HEIGHT};
    }

    .carousel[data-solo] .card {
      box-shadow: none;
    }

    .slide {
      --offset: 100% + 4px;
    }

    .slide[data-active] {
      --offset: -4px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slide {
      transition: none;
    }
  }
`;

export interface CarouselLabels {
  /** Accessible name of the carousel. */
  carousel: string;
  /** What the carousel is, read instead of "region". */
  carouselRole: string;
  previous: string;
  next: string;
}

export interface CarouselOptions {
  labels: CarouselLabels;
  /**
   * Called when the highlight moves, before the host renders it: `from` is
   * the card that loses it.
   */
  onStep?: (from: number, to: number) => void;
  /**
   * While true, the highlight doesn't move, by hand or on its own (for
   * example, while the player shows the highlighted Story).
   */
  locked?: () => boolean;
}

/** Renders the card of one Story. `active`: it has the highlight. */
export type RenderSlide<T> = (
  item: T,
  index: number,
  active: boolean,
) => TemplateResult;

/**
 * The carousel around the Story cards: which Story has the highlight, the
 * arrows, swipes and the automatic advance. Call reset() when the Stories
 * change, and render() from the host's render.
 *
 * The highlight moves on its own every AUTO_ADVANCE_MS, except while the
 * pointer is over the carousel, the keyboard focus is in it, it is locked,
 * or the host is off the page.
 */
export class CarouselController implements ReactiveController {
  /** Index of the highlighted Story. */
  active = 0;

  private count = 0;
  private connected = false;
  private hovered = false;
  private focused = false;
  private timer?: ReturnType<typeof setInterval>;
  private swipe?: { x: number; moved: boolean };

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: CarouselOptions,
  ) {
    host.addController(this);
  }

  hostConnected() {
    this.connected = true;
    this.syncTimer();
  }

  hostDisconnected() {
    this.connected = false;
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
    this.active = 0;
    this.restartTimer();
  }

  /** Moves the highlight by `delta` Stories, wrapping around the ends. */
  step(delta: number) {
    if (this.count < 2 || this.options.locked?.()) return;

    const from = this.active;
    const to = (((from + delta) % this.count) + this.count) % this.count;
    if (to === from) return;

    this.options.onStep?.(from, to);
    this.active = to;
    this.host.requestUpdate();
    // A step by hand gives the new Story its full time.
    this.restartTimer();
  }

  /** Gives the highlight to the Story at `index`. */
  select(index: number) {
    this.step(index - this.active);
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

  private readonly onPointerDown = (event: PointerEvent) => {
    this.swipe = { x: event.clientX, moved: false };
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    const { swipe } = this;
    if (!swipe) return;

    const distance = event.clientX - swipe.x;
    if (Math.abs(distance) > SWIPE_DISTANCE) {
      swipe.moved = true;
      this.step(distance < 0 ? 1 : -1);
    }
  };

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

  /**
   * One item: the card centered over the background.
   * Two items: both cards side by side, with the arrows.
   */
  render<T>(items: readonly T[], renderSlide: RenderSlide<T>) {
    if (items.length === 1) {
      return html`
        <div class="carousel" data-solo>${renderSlide(items[0], 0, true)}</div>
      `;
    }

    const { labels } = this.options;
    const locked = this.options.locked?.() ?? false;

    return html`
      <div
        class="carousel"
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
          @pointerdown=${this.onPointerDown}
          @pointerup=${this.onPointerUp}
          @click=${this.onClickCapture}
        >
          ${items.map((item, index) => {
            const active = index === this.active;
            return html`
              <div class="slide" data-index=${index} ?data-active=${active}>
                ${renderSlide(item, index, active)}
              </div>
            `;
          })}
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

import { css, html, nothing } from "lit";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { icon } from "../icons";
import { hasVideo, renderMedia, VideoController } from "../media";
import type { StoryMedia } from "../../types";

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

  .player-frame {
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

  /* Above the card: on narrow screens the expanded card can cover them. */
  .player-controls {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    z-index: 1;
    display: flex;
    gap: 8px;
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

  @media (max-width: 576px) {
    .player {
      right: 12px;
      width: 220px;
      height: 391px;
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
  /** Accessible name of the player. */
  label: string;
  /** Accessible names of the buttons. */
  expandLabel: string;
  collapseLabel: string;
  closeLabel: string;
  playLabel: string;
  pauseLabel: string;
  soundOnLabel: string;
  soundOffLabel: string;
  /**
   * Called by the close button, Escape and a click on the expanded view's
   * backdrop. Call close() from it.
   */
  onClose: () => void;
}

function supportsPopover(dialog: HTMLDialogElement) {
  return typeof dialog.showPopover === "function";
}

/**
 * The Story player, rendered by its host with render(). open() shows it as
 * the mini player; expand switches to the expanded view, a modal dialog, and
 * back. The video starts muted and plays when the player opens. It closes on
 * its own when the host leaves the page.
 */
export class PlayerController implements ReactiveController {
  readonly video: VideoController;

  /** Rendered and, once the host has updated, shown. */
  isOpen = false;
  private expanded = false;
  /** Switched modes at least once: only the first opening fades in. */
  private switched = false;
  /** The dialog is showing, in the mode `expanded` says. */
  private shown = false;

  private readonly dialog = createRef<HTMLDialogElement>();
  private readonly expandButton = createRef<HTMLButtonElement>();
  private readonly closeButton = createRef<HTMLButtonElement>();

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

  /** Opens the mini player, plays the video and focuses the close button. */
  async open() {
    if (this.isOpen) return;

    document.addEventListener("keydown", this.onKeyDown);
    this.isOpen = true;
    this.expanded = false;
    this.switched = false;
    this.video.reset();
    this.host.requestUpdate();
    await this.host.updateComplete;

    const dialog = this.dialog.value;
    // Closed again before the host rendered it.
    if (!this.isOpen || !dialog) return;

    this.show(dialog);
    this.video.play();
    this.closeButton.value?.focus();
  }

  /** Hides the player now; the host removes it on its next update. */
  close() {
    if (!this.isOpen) return;

    document.removeEventListener("keydown", this.onKeyDown);
    const dialog = this.dialog.value;
    if (dialog) this.hide(dialog);
    this.isOpen = false;
    this.host.requestUpdate();
  }

  // Mini: a manual popover, or a non-modal dialog without popover support.
  // Expanded: a modal dialog.
  private show(dialog: HTMLDialogElement) {
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
  private renderVideoControls() {
    const { video, options } = this;

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
        aria-label=${video.paused ? options.playLabel : options.pauseLabel}
        @click=${onToggle}
      >
        ${icon(video.paused ? "play" : "pause")}
      </button>
      <button
        type="button"
        class="player-button player-sound"
        aria-label=${video.muted ? options.soundOnLabel : options.soundOffLabel}
        @click=${onSound}
      >
        ${icon(video.muted ? "soundOff" : "soundOn")}
      </button>
    `;
  }

  /**
   * The player <dialog> while it is open. Clicking the video also plays or
   * pauses it.
   */
  render(story: StoryMedia) {
    if (!this.isOpen) return nothing;

    const { video, options, expanded } = this;
    const withVideo = hasVideo(story, video);

    return html`
      <dialog
        class="player"
        popover="manual"
        aria-label=${options.label}
        ?data-expanded=${expanded}
        ?data-switched=${this.switched}
        ?data-paused=${withVideo && video.paused}
        ${ref(this.dialog)}
        @click=${this.onDialogClick}
        @cancel=${this.onCancel}
      >
        <div class="player-frame">
          <div class="player-controls">
            <button
              type="button"
              class="player-button player-expand"
              aria-label=${expanded
                ? options.collapseLabel
                : options.expandLabel}
              ${ref(this.expandButton)}
              @click=${this.toggleExpanded}
            >
              ${icon(expanded ? "collapse" : "expand")}
            </button>
            <button
              type="button"
              class="player-button player-close"
              aria-label=${options.closeLabel}
              ${ref(this.closeButton)}
              @click=${options.onClose}
            >
              ${icon("close")}
            </button>
          </div>
          <div class="card" @click=${() => video.togglePlayback()}>
            ${renderMedia(story, video)}
            ${withVideo ? this.renderVideoControls() : nothing}
          </div>
        </div>
      </dialog>
    `;
  }
}

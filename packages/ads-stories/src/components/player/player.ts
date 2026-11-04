import { createCard, playVideo } from "../card";
import { createIcon, type IconName } from "../icons";
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
export const playerStyles = `
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
  onClose: () => void;
}

function createButton(className: string, label: string, icon: IconName) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `player-button ${className}`;
  button.setAttribute("aria-label", label);
  button.append(createIcon(icon));
  return button;
}

function supportsPopover(player: HTMLDialogElement) {
  return typeof player.showPopover === "function";
}

/** Shows the player as the mini player. It must already be in the page. */
export function showPlayer(player: HTMLDialogElement) {
  if (supportsPopover(player)) player.showPopover();
  else player.show();
}

/** Plays the player's video, if it has one. */
export function playPlayer(player: HTMLDialogElement) {
  const video = player.querySelector("video");
  if (video) playVideo(video);
}

/**
 * Play/pause in the middle of the video and sound on/off at its top right.
 * Clicking the video also plays or pauses it. The buttons follow the video's
 * own events, so a blocked autoplay shows as paused.
 */
function addVideoControls(
  player: HTMLDialogElement,
  card: HTMLElement,
  video: HTMLVideoElement,
  options: PlayerOptions,
) {
  // Not a .player-button: it keeps the card's larger glass look.
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "play player-toggle";
  const sound = createButton("player-sound", "", "soundOff");

  function syncPlayback() {
    player.toggleAttribute("data-paused", video.paused);
    toggle.setAttribute(
      "aria-label",
      video.paused ? options.playLabel : options.pauseLabel,
    );
    toggle.replaceChildren(createIcon(video.paused ? "play" : "pause"));
  }

  function syncSound() {
    sound.setAttribute(
      "aria-label",
      video.muted ? options.soundOnLabel : options.soundOffLabel,
    );
    sound.replaceChildren(createIcon(video.muted ? "soundOff" : "soundOn"));
  }

  function togglePlayback() {
    if (video.paused) playVideo(video);
    else video.pause();
  }

  video.addEventListener("play", syncPlayback);
  video.addEventListener("pause", syncPlayback);
  video.addEventListener("volumechange", syncSound);
  // Without the video, the cover stays and there is nothing to control.
  video.addEventListener("error", () => {
    toggle.remove();
    sound.remove();
    delete player.dataset.paused;
  });

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlayback();
  });
  sound.addEventListener("click", (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
  });
  card.addEventListener("click", () => {
    if (video.isConnected) togglePlayback();
  });

  syncPlayback();
  syncSound();
  card.append(toggle, sound);
}

/**
 * The Story player. It opens as the mini player (see showPlayer); expand
 * switches to the expanded view, a modal dialog, and back. Clicking the
 * backdrop of the expanded view or pressing Escape in it closes the player.
 * The video starts muted (see playPlayer).
 */
export function createPlayer(story: StoryMedia, options: PlayerOptions) {
  const player = document.createElement("dialog");
  player.className = "player";
  player.setAttribute("popover", "manual");
  player.setAttribute("aria-label", options.label);

  const frame = document.createElement("div");
  frame.className = "player-frame";

  const controls = document.createElement("div");
  controls.className = "player-controls";

  const expand = createButton("player-expand", options.expandLabel, "expand");
  const close = createButton("player-close", options.closeLabel, "close");
  controls.append(expand, close);

  let expanded = false;

  // A dialog can't be shown as a popover and as a modal at the same time, so
  // switching modes hides it first, the same way it was shown.
  function hide() {
    if (!expanded && supportsPopover(player)) player.hidePopover();
    else player.close();
  }

  expand.addEventListener("click", () => {
    hide();
    expanded = !expanded;
    player.toggleAttribute("data-expanded", expanded);
    player.dataset.switched = "";
    expand.setAttribute(
      "aria-label",
      expanded ? options.collapseLabel : options.expandLabel,
    );
    expand.replaceChildren(createIcon(expanded ? "collapse" : "expand"));

    if (expanded) player.showModal();
    else showPlayer(player);
    expand.focus();
  });

  close.addEventListener("click", options.onClose);

  // Clicks on the backdrop of the expanded view reach the dialog itself.
  player.addEventListener("click", (event) => {
    if (expanded && event.target === player) options.onClose();
  });

  // Escape on a modal dialog would only hide it: close the player instead.
  player.addEventListener("cancel", (event) => {
    event.preventDefault();
    options.onClose();
  });

  const card = createCard(story);
  const video = card.querySelector("video");
  if (video) addVideoControls(player, card, video, options);

  frame.append(controls, card);
  player.append(frame);
  return player;
}

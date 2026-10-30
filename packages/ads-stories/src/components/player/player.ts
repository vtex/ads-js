import { createCard } from "../card";
import { createIcon, type IconName } from "../icons";
import type { StoryAd } from "../../types";

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

  .player-controls {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
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

    .player[data-expanded] .player-controls {
      top: 12px;
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

/**
 * The Story player. It opens as the mini player (see showPlayer); expand
 * switches to the expanded view, a modal dialog, and back. Clicking the
 * backdrop of the expanded view or pressing Escape in it closes the player.
 */
export function createPlayer(story: StoryAd, options: PlayerOptions) {
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

  frame.append(controls, createCard(story));
  player.append(frame);
  return player;
}

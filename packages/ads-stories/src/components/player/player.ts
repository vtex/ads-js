import { createCard } from "../card";
import { createIcon, type IconName } from "../icons";
import type { StoryAd } from "../../types";

// The player is a manual popover, so it opens in the top layer: no store
// z-index, overflow or transform can hide or move it. Where popovers are not
// supported it is still a fixed element, with a high z-index.
//
// Mini: the card at the bottom right, with the controls above it.
// Expanded: the card centered over a dark backdrop, with the controls at the
// top right of the screen. On narrow screens it fills the screen.
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
    height: 100%;
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

/**
 * The Story player. It opens as the mini player; expand toggles the expanded
 * view. Clicking the backdrop of the expanded view closes it.
 */
export function createPlayer(story: StoryAd, options: PlayerOptions) {
  const player = document.createElement("div");
  player.className = "player";
  player.setAttribute("popover", "manual");
  player.setAttribute("role", "dialog");
  player.setAttribute("aria-label", options.label);

  const frame = document.createElement("div");
  frame.className = "player-frame";

  const controls = document.createElement("div");
  controls.className = "player-controls";

  const expand = createButton("player-expand", options.expandLabel, "expand");
  const close = createButton("player-close", options.closeLabel, "close");
  controls.append(expand, close);

  let expanded = false;
  expand.addEventListener("click", () => {
    expanded = !expanded;
    player.toggleAttribute("data-expanded", expanded);
    expand.setAttribute(
      "aria-label",
      expanded ? options.collapseLabel : options.expandLabel,
    );
    expand.replaceChildren(createIcon(expanded ? "collapse" : "expand"));
  });

  close.addEventListener("click", options.onClose);
  player.addEventListener("click", (event) => {
    if (expanded && event.target === player) options.onClose();
  });

  frame.append(controls, createCard(story));
  player.append(frame);
  return player;
}

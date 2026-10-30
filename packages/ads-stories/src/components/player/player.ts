import { createCard } from "../card";
import { createIcon } from "../icons";
import type { StoryAd } from "../../types";

// The player is a manual popover, so it opens in the top layer: no store
// z-index, overflow or transform can hide or move it. Where popovers are not
// supported it is still a fixed element, with a high z-index.
export const playerStyles = `
  .player {
    position: fixed;
    inset: auto 16px 16px auto;
    z-index: 1000;
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
  /** Accessible name of the close button. */
  closeLabel: string;
  onClose: () => void;
}

/** The mini player: the Story card at the bottom right, with close above it. */
export function createPlayer(story: StoryAd, options: PlayerOptions) {
  const player = document.createElement("div");
  player.className = "player";
  player.setAttribute("popover", "manual");
  player.setAttribute("role", "dialog");
  player.setAttribute("aria-label", options.label);

  const controls = document.createElement("div");
  controls.className = "player-controls";

  const close = document.createElement("button");
  close.type = "button";
  close.className = "player-button";
  close.setAttribute("aria-label", options.closeLabel);
  close.append(createIcon("close"));
  close.addEventListener("click", options.onClose);
  controls.append(close);

  player.append(controls, createCard(story));
  return player;
}

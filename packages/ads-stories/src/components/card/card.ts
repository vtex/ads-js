import { createIcon } from "../icons";
import type { StoryAd } from "../../types";

export const cardStyles = `
  .card {
    position: relative;
    box-sizing: border-box;
    width: calc(500px * 9 / 16);
    height: 500px;
    overflow: hidden;
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: #000;
  }

  .card[role="button"] {
    cursor: pointer;
  }

  .poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play {
    position: absolute;
    top: 50%;
    left: 50%;
    display: grid;
    width: 66px;
    height: 66px;
    place-items: center;
    border-radius: 50%;
    background:
      linear-gradient(rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.06)),
      rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(2px);
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.42);
    transform: translate(-50%, -50%);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  /* The icon's triangle is 18px tall and already sits slightly right of its
     box, so it looks centered in the circle. */
  .play .icon {
    width: 22px;
    height: 22px;
    color: #fff;
  }

  /* With a mouse, the play button shows only on hover or keyboard focus.
     Touch screens have no hover, so it stays visible there. */
  @media (hover: hover) and (pointer: fine) {
    .play {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }

    .card:hover .play,
    .card:focus-visible .play {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

export interface CardOptions {
  /** Accessible name of the card. */
  label: string;
  /** Called on click, Enter or Space. */
  onSelect: () => void;
}

// Only absolute http(s) URLs reach the DOM.
function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * A 9:16 card with the Story cover. With options, the card is a button with
 * a play icon in the middle.
 */
export function createCard(story: StoryAd, options?: CardOptions) {
  const card = document.createElement("div");
  card.className = "card";

  if (story.poster_url && isHttpUrl(story.poster_url)) {
    const poster = document.createElement("img");
    poster.className = "poster";
    poster.alt = "";
    poster.src = story.poster_url;
    card.append(poster);
  }

  if (options) {
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", options.label);
    card.tabIndex = 0;

    const play = document.createElement("span");
    play.className = "play";
    play.setAttribute("aria-hidden", "true");
    play.append(createIcon("play"));
    card.append(play);

    card.addEventListener("click", options.onSelect);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      options.onSelect();
    });
  }

  return card;
}

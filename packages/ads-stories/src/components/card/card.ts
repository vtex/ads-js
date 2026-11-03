import { createIcon } from "../icons";
import type { StoryMedia } from "../../types";

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

  .poster,
  .video {
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

// Only http(s) URLs reach the DOM. Relative URLs resolve against the page.
function httpUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value, document.baseURI);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return (
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

/**
 * Plays a video. A blocked play is ignored: the cover or the paused state
 * stays.
 */
export function playVideo(video: HTMLVideoElement) {
  video.play()?.catch(() => undefined);
}

function createVideo(src: string, poster: string | null) {
  const video = document.createElement("video");
  video.className = "video";
  // Muted and inline is what browsers, iOS included, allow to autoplay.
  video.muted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.loop = true;
  video.preload = "metadata";
  // No autoplay for people who asked for reduced motion.
  video.autoplay = !prefersReducedMotion();
  if (poster) video.poster = poster;
  video.src = src;

  // If the video can't load, the cover underneath stays.
  video.addEventListener("error", () => video.remove());
  return video;
}

/**
 * A 9:16 card with the Story cover and, with a media_url, the video looping
 * muted over it. With options, the card is a button with a play icon in the
 * middle.
 */
export function createCard(story: StoryMedia, options?: CardOptions) {
  const card = document.createElement("div");
  card.className = "card";

  const posterUrl = httpUrl(story.poster_url);
  if (posterUrl) {
    const poster = document.createElement("img");
    poster.className = "poster";
    poster.alt = "";
    poster.src = posterUrl;
    card.append(poster);
  }

  const mediaUrl = httpUrl(story.media_url);
  if (mediaUrl) card.append(createVideo(mediaUrl, posterUrl));

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

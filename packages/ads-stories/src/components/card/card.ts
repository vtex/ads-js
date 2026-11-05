import { css, html, nothing } from "lit";
import { icon } from "../icons";
import { hasVideo, renderMedia, type VideoController } from "../media";
import type { StoryMedia } from "../../types";

export const cardStyles = css`
  /* 9:16 at the height its container gives it (--card-height, default
     500px). */
  .card {
    position: relative;
    box-sizing: border-box;
    width: calc(var(--card-height, 500px) * 9 / 16);
    height: var(--card-height, 500px);
    overflow: hidden;
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: #000;
  }

  /* The card's button covers it. The focus ring goes on the card, since the
     card's overflow would clip the button's own. */
  .card-open {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .card-open:focus-visible {
    outline: none;
  }

  .card:has(> .card-open:focus-visible) {
    outline: auto;
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

  /* Sound on/off, at the top right of the card (as in the prototype). */
  .card-sound {
    position: absolute;
    top: 22px;
    right: 12px;
    z-index: 1;
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  }

  .card-sound .icon {
    width: 20px;
    height: 20px;
  }

  /* With a mouse, the play button shows only on hover or keyboard focus.
     Touch screens have no hover, so it stays visible there. */
  @media (hover: hover) and (pointer: fine) {
    .play {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }

    .card:hover .play,
    .card-open:focus-visible .play {
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
  /**
   * Whether the video plays over the cover (default true). Without it, the
   * card shows only the cover, with no sound button.
   */
  withVideo?: boolean;
  /** Accessible names of the sound button, shown when the card has a video. */
  soundOnLabel: string;
  soundOffLabel: string;
}

/**
 * Sound on/off for the card's video, which starts muted. Only shown while the
 * video plays: a video that never plays (reduced motion, or autoplay blocked
 * as in iOS Low Power Mode) has no sound to turn on, and the card paused
 * behind the open player needs none.
 */
function renderSoundButton(video: VideoController, options: CardOptions) {
  return html`
    <button
      type="button"
      class="card-sound"
      aria-label=${video.muted ? options.soundOnLabel : options.soundOffLabel}
      @click=${() => video.toggleMuted()}
    >
      ${icon(video.muted ? "soundOff" : "soundOn")}
    </button>
  `;
}

/**
 * A 9:16 card with the Story cover and, with a media_url, the video looping
 * muted over it (see renderMedia). A button with a play icon in the middle
 * covers the card, and a sound button shows while the video plays. The sound
 * button is beside the card's button, not inside it: a button can't contain
 * another.
 */
export function renderCard(
  story: StoryMedia,
  video: VideoController,
  options: CardOptions,
) {
  const withVideo = options.withVideo ?? true;

  return html`
    <div class="card">
      ${renderMedia(story, video, { withVideo })}
      <button
        type="button"
        class="card-open"
        aria-label=${options.label}
        @click=${options.onSelect}
      >
        <span class="play" aria-hidden="true">${icon("play")}</span>
      </button>
      ${withVideo && hasVideo(story, video) && !video.paused
        ? renderSoundButton(video, options)
        : nothing}
    </div>
  `;
}

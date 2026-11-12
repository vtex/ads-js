import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import type { StoryLabels } from "../../locales";
import { icon } from "../icons";
import type { StoryMedia } from "../../types";
import { httpUrl } from "../../utils/safe-url";
import type { VideoController } from "./video-controller";

/** Media query for people who asked the system for less motion. */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return globalThis.matchMedia?.(REDUCED_MOTION).matches ?? false;
}

/**
 * Whether renderMedia shows a playable video for this Story right now: not
 * one that failed or is loading again.
 */
export function hasVideo(story: StoryMedia, video: VideoController) {
  return !video.failed && !video.retrying && httpUrl(story.media_url) !== null;
}

export interface MediaOptions {
  /** Whether the video shows over the cover (default true). */
  withVideo?: boolean;
  /** Whether the video loops (default true). */
  loop?: boolean;
  /** Called when a video that doesn't loop reaches its end. */
  onEnded?: () => void;
  /**
   * Whether the video plays on its own (default true; never with reduced
   * motion). Without it, the video loads in full but waits to be played.
   */
  autoplay?: boolean;
  /**
   * The texts of the notice over the cover when the video can't load.
   * Without them, only the cover shows.
   */
  labels?: StoryLabels;
  /**
   * Offers to load a failed video again (see VideoController.retry), with a
   * button in the notice. Without it, the notice only says the video is
   * unavailable.
   */
  onRetry?: () => void;
}

// What the notice says, and the retry button when there is one.
function renderFailed(labels: StoryLabels, onRetry?: () => void) {
  return html`
    <div class="media-status" role="status" ?data-retry=${!!onRetry}>
      <span class="media-status-text">
        ${icon("warning")}
        ${onRetry ? labels.videoFailed : labels.videoUnavailable}
      </span>
      ${onRetry
        ? html`
            <button type="button" class="media-retry" @click=${onRetry}>
              ${labels.retry}
            </button>
          `
        : nothing}
    </div>
  `;
}

function renderVideoLoading(labels: StoryLabels) {
  return html`
    <div class="media-status" role="status">
      <span class="media-status-text">
        <span class="media-spinner" aria-hidden="true"></span>
        ${labels.videoLoading}
      </span>
    </div>
  `;
}

// The notice over the cover, if the video failed or is loading again.
function renderStatus(
  video: VideoController,
  { labels, onRetry }: MediaOptions,
) {
  if (!labels) return nothing;
  if (video.failed) return renderFailed(labels, onRetry);
  if (video.retrying) return renderVideoLoading(labels);
  return nothing;
}

/**
 * The Story cover and, with a media_url, the video looping muted over it. If
 * the video can't load, it is removed and the cover underneath stays, with a
 * notice over it when there are `labels` (and a retry button with
 * `onRetry`). With withVideo false, only the cover.
 */
export function renderMedia(
  story: StoryMedia,
  video: VideoController,
  options: MediaOptions = {},
) {
  const { withVideo = true, loop = true, onEnded, autoplay = true } = options;
  const posterUrl = httpUrl(story.poster_url);
  const mediaUrl = withVideo ? httpUrl(story.media_url) : null;
  const preload = autoplay ? "metadata" : "auto";

  // Muted and inline is what browsers, iOS included, allow to autoplay. The
  // muted attribute and property are both set, since browsers differ on
  // which one they read for autoplay. No autoplay for people who asked for
  // reduced motion.
  return html`
    ${posterUrl
      ? html`<img class="poster" alt="" src=${posterUrl} />`
      : nothing}
    ${mediaUrl && !video.failed
      ? html`
          <video
            class="video"
            muted
            playsinline
            ?loop=${loop}
            preload=${preload}
            .muted=${true}
            ?autoplay=${autoplay && !prefersReducedMotion()}
            poster=${posterUrl ?? nothing}
            src=${mediaUrl}
            ${ref(video.ref)}
            @play=${video.sync}
            @pause=${video.sync}
            @volumechange=${video.sync}
            @loadeddata=${video.loaded}
            @error=${video.fail}
            @ended=${onEnded}
          ></video>
        `
      : nothing}
    ${mediaUrl ? renderStatus(video, options) : nothing}
  `;
}

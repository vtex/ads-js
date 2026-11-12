import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import type { StoryMedia } from "../../types";
import { httpUrl } from "../../utils/safe-url";
import type { VideoController } from "./video-controller";

/** Media query for people who asked the system for less motion. */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return globalThis.matchMedia?.(REDUCED_MOTION).matches ?? false;
}

/** Whether renderMedia shows a video for this Story right now. */
export function hasVideo(story: StoryMedia, video: VideoController) {
  return !video.failed && httpUrl(story.media_url) !== null;
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
}

/**
 * The Story cover and, with a media_url, the video looping muted over it. If
 * the video can't load, it is removed and the cover underneath stays. With
 * withVideo false, only the cover.
 */
export function renderMedia(
  story: StoryMedia,
  video: VideoController,
  {
    withVideo = true,
    loop = true,
    onEnded,
    autoplay = true,
  }: MediaOptions = {},
) {
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
  `;
}

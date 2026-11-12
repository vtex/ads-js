import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import type { StoryMedia } from "../../types";
import { httpUrl } from "../../utils/http-url";
import type { VideoController } from "./video-controller";

export function prefersReducedMotion() {
  return (
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
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
}

/**
 * The Story cover and, with a media_url, the video looping muted over it. If
 * the video can't load, it is removed and the cover underneath stays. With
 * withVideo false, only the cover.
 */
export function renderMedia(
  story: StoryMedia,
  video: VideoController,
  { withVideo = true, loop = true, onEnded }: MediaOptions = {},
) {
  const posterUrl = httpUrl(story.poster_url);
  const mediaUrl = withVideo ? httpUrl(story.media_url) : null;

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
            preload="metadata"
            .muted=${true}
            ?autoplay=${!prefersReducedMotion()}
            poster=${posterUrl ?? nothing}
            src=${mediaUrl}
            ${ref(video.ref)}
            @play=${video.sync}
            @pause=${video.sync}
            @volumechange=${video.sync}
            @error=${video.fail}
            @ended=${onEnded}
          ></video>
        `
      : nothing}
  `;
}

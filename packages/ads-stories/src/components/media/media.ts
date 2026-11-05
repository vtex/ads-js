import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import type { StoryMedia } from "../../types";
import type { VideoController } from "./video-controller";

// Only absolute http(s) URLs reach the DOM. Relative and protocol-relative
// ones ("/a.jpg", "//host/a.jpg") don't parse without a base, so they're out.
export function httpUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return (
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

/** Whether renderMedia shows a video for this Story right now. */
export function hasVideo(story: StoryMedia, video: VideoController) {
  return !video.failed && httpUrl(story.media_url) !== null;
}

/**
 * The Story cover and, with a media_url, the video looping muted over it. If
 * the video can't load, it is removed and the cover underneath stays. With
 * withVideo false, only the cover.
 */
export function renderMedia(
  story: StoryMedia,
  video: VideoController,
  withVideo = true,
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
            loop
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
          ></video>
        `
      : nothing}
  `;
}

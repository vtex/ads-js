import type { ReactiveControllerHost } from "lit";
import { createRef } from "lit/directives/ref.js";

/**
 * Plays a video. A blocked play is ignored: the cover or the paused state
 * stays.
 */
export function playVideo(video: HTMLVideoElement) {
  video.play()?.catch(() => undefined);
}

/**
 * Follows one rendered <video> (see renderMedia) and re-renders its host when
 * it plays, pauses, is muted or unmuted, or fails to load. The state comes
 * from the video's own events, so a blocked autoplay shows as paused. It needs
 * no lifecycle hooks: the browser pauses a video removed from the page.
 */
export class VideoController {
  /** Bound to the <video> by renderMedia. */
  readonly ref = createRef<HTMLVideoElement>();

  paused = true;
  // The video always starts muted: that is what browsers allow to autoplay.
  muted = true;
  /** The video could not load: only the cover is shown. */
  failed = false;

  constructor(private readonly host: ReactiveControllerHost) {}

  /** For a new <video>, such as each time the player opens. */
  reset() {
    this.paused = true;
    this.muted = true;
    this.failed = false;
  }

  play() {
    const video = this.ref.value;
    if (video) playVideo(video);
  }

  pause() {
    this.ref.value?.pause();
  }

  /** Plays again if the video plays on its own (see renderMedia). */
  resume() {
    const video = this.ref.value;
    if (video?.autoplay) playVideo(video);
  }

  togglePlayback() {
    const video = this.ref.value;
    if (!video) return;
    if (video.paused) playVideo(video);
    else video.pause();
  }

  mute() {
    const video = this.ref.value;
    if (video) video.muted = true;
  }

  toggleMuted() {
    const video = this.ref.value;
    if (video) video.muted = !video.muted;
  }

  /** Listener for the video's play, pause and volumechange events. */
  readonly sync = () => {
    const video = this.ref.value;
    if (!video) return;
    this.paused = video.paused;
    this.muted = video.muted;
    this.host.requestUpdate();
  };

  /** Listener for the video's error event. */
  readonly fail = () => {
    this.failed = true;
    this.host.requestUpdate();
  };
}

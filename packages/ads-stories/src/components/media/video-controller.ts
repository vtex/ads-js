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
  private status: "playable" | "failed" | "retrying" = "playable";

  private readyState!: Promise<boolean>;
  private settleReady!: (ready: boolean) => void;

  constructor(private readonly host: ReactiveControllerHost) {
    this.waitForReady();
  }

  /**
   * Resolves true once the video's first frame has loaded, or false if it
   * fails. A new one for each new <video> (see reset).
   */
  get ready(): Promise<boolean> {
    return this.readyState;
  }

  /** The video could not load: the cover shows with a notice over it. */
  get failed() {
    return this.status === "failed";
  }

  /** A failed video is loading again (see retry), until it loads or fails. */
  get retrying() {
    return this.status === "retrying";
  }

  /** The rendered <video> is on the page and playing. */
  get playing() {
    const video = this.ref.value;
    return !!video && video.isConnected && !video.paused;
  }

  /** For a new <video>, such as each time the player opens. */
  reset() {
    this.paused = true;
    this.muted = true;
    this.status = "playable";
    this.waitForReady();
  }

  /**
   * For the next Story's <video>: neither failed nor loading again. Unlike
   * reset, it keeps the playback and sound state.
   */
  clearFailure() {
    this.status = "playable";
    this.host.requestUpdate();
  }

  /**
   * Loads a failed video again: renderMedia renders a new <video> with a
   * notice that it is loading, until it loads or fails. Resolves as `ready`
   * does, or false at once for a video that didn't fail.
   */
  retry() {
    if (this.retrying) return this.ready;
    if (!this.failed) return Promise.resolve(false);
    this.reset();
    this.status = "retrying";
    this.host.requestUpdate();
    return this.ready;
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

  /**
   * Plays from the start, with the sound on if `withSound`. A new src starts
   * there anyway; the same src (two Stories with one video) would otherwise
   * go on where it was.
   */
  restart({ withSound = false } = {}) {
    const video = this.ref.value;
    if (!video) return;

    video.currentTime = 0;
    if (withSound) this.playWithSound();
    else playVideo(video);
  }

  /**
   * Plays with the sound on. A browser that blocks playing with sound (for
   * example, without a recent tap) gets it muted instead: the video keeps
   * playing, and the sound button offers to turn it on. Not if the video was
   * replaced or removed meanwhile (the request then fails for that reason):
   * it would play out of sight.
   */
  playWithSound() {
    const video = this.ref.value;
    if (!video) return;

    video.muted = false;
    video.play()?.catch((error: unknown) => {
      const blocked =
        error instanceof DOMException && error.name === "NotAllowedError";
      if (!blocked || this.ref.value !== video || !video.isConnected) return;

      video.muted = true;
      playVideo(video);
    });
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

  /** Listener for the video's loadeddata event. */
  readonly loaded = () => {
    this.settleReady(true);
    if (!this.retrying) return;
    this.status = "playable";
    this.host.requestUpdate();
  };

  /** Listener for the video's error event. */
  readonly fail = () => {
    this.status = "failed";
    this.settleReady(false);
    this.host.requestUpdate();
  };

  private waitForReady() {
    this.readyState = new Promise((settle) => (this.settleReady = settle));
  }
}

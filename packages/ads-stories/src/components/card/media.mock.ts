// jsdom does not implement media playback: play() and pause() only report
// "not implemented" and `paused` is always true. These stand-ins track the
// state and fire the play and pause events, as browsers do.
const playing = new WeakSet<HTMLMediaElement>();

export function installMediaMocks() {
  const media = HTMLMediaElement.prototype;

  Object.defineProperty(media, "paused", {
    configurable: true,
    get(this: HTMLMediaElement) {
      return !playing.has(this);
    },
  });

  media.play = function (this: HTMLMediaElement) {
    if (!playing.has(this)) {
      playing.add(this);
      this.dispatchEvent(new Event("play"));
    }
    return Promise.resolve();
  };

  media.pause = function (this: HTMLMediaElement) {
    if (playing.has(this)) {
      playing.delete(this);
      this.dispatchEvent(new Event("pause"));
    }
  };
}

import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { mountHost } from "../host.mock";
import { installMediaMocks } from "./media.mock";
import { renderMedia } from "./media";
import { VideoController } from "./video-controller";
import type { StoryMedia } from "../../types";

function mount(story: StoryMedia) {
  const { container, controller: video } = mountHost(
    (host) => new VideoController(host),
    (video) => renderMedia(story, video),
  );
  return { container, video };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("renderMedia cover", () => {
  it("renders the poster", () => {
    const { container } = mount({
      poster_url: "https://example.com/cover.jpg",
    });

    const poster = container.querySelector<HTMLImageElement>(".poster");
    expect(poster?.src).toBe("https://example.com/cover.jpg");
    expect(poster?.alt).toBe("");
  });

  it("renders no poster without a poster_url", () => {
    const { container } = mount({});
    expect(container.querySelector(".poster")).toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "/stories/cover.jpg",
    "//attacker.example/cover.jpg",
  ])(
    "ignores a poster_url that is not an absolute http(s) URL: %s",
    (posterUrl) => {
      const { container } = mount({ poster_url: posterUrl });
      expect(container.querySelector(".poster")).toBeNull();
    },
  );
});

describe("renderMedia video", () => {
  const story = {
    poster_url: "https://example.com/cover.jpg",
    media_url: "https://example.com/story.mp4",
  };

  beforeAll(() => {
    installMediaMocks();
  });

  it("loops the video muted and inline over the cover", () => {
    const { container } = mount(story);

    const video = container.querySelector("video");
    expect(video?.getAttribute("src")).toBe("https://example.com/story.mp4");
    expect(video?.getAttribute("poster")).toBe("https://example.com/cover.jpg");
    expect(video?.muted).toBe(true);
    expect(video?.hasAttribute("muted")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.autoplay).toBe(true);
    // The cover stays underneath for when the video can't play.
    expect(container.querySelector(".poster")).not.toBeNull();
  });

  it("has no poster attribute without a cover", () => {
    const { container } = mount({ media_url: story.media_url });
    expect(container.querySelector("video")?.hasAttribute("poster")).toBe(
      false,
    );
  });

  it("does not autoplay for people who prefer reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
    }));

    const { container } = mount(story);
    expect(container.querySelector("video")?.autoplay).toBe(false);
  });

  it("removes the video when it fails to load, leaving the cover", () => {
    const { container, video } = mount(story);
    container.querySelector("video")?.dispatchEvent(new Event("error"));

    expect(video.failed).toBe(true);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector(".poster")).not.toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "data:video/mp4;base64,AAAA",
    "/stories/story.mp4",
    "//attacker.example/story.mp4",
  ])(
    "ignores a media_url that is not an absolute http(s) URL: %s",
    (mediaUrl) => {
      const { container } = mount({ ...story, media_url: mediaUrl });
      expect(container.querySelector("video")).toBeNull();
    },
  );
});

describe("VideoController", () => {
  const story = { media_url: "https://example.com/story.mp4" };

  beforeAll(() => {
    installMediaMocks();
  });

  it("follows the video's playback and sound", () => {
    const { container, video } = mount(story);
    const element = container.querySelector("video");
    expect(video.paused).toBe(true);
    expect(video.muted).toBe(true);

    video.play();
    expect(element?.paused).toBe(false);
    expect(video.paused).toBe(false);

    video.togglePlayback();
    expect(video.paused).toBe(true);

    video.toggleMuted();
    // jsdom fires volumechange later, as browsers do.
    element?.dispatchEvent(new Event("volumechange"));
    expect(element?.muted).toBe(false);
    expect(video.muted).toBe(false);
  });

  it("resumes only a video that plays on its own", () => {
    const { video } = mount(story);
    video.resume();
    expect(video.paused).toBe(false);

    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const reduced = mount(story).video;
    reduced.resume();
    expect(reduced.paused).toBe(true);
  });

  it("does nothing without a video", () => {
    const { video } = mount({});

    expect(() => {
      video.play();
      video.pause();
      video.resume();
      video.togglePlayback();
      video.toggleMuted();
    }).not.toThrow();
  });
});

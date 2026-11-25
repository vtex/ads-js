import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { mountHost } from "../host.mock";
import { installMediaMocks } from "../media/media.mock";
import { VideoController } from "../media";
import { renderCard, type CardOptions } from "./card";
import type { StoryMedia } from "../../types";
import { pt } from "../../locales";

const options = { label: "Assistir vídeo", labels: pt };

function mount(story: StoryMedia, extra?: Partial<CardOptions>) {
  const onSelect = vi.fn();
  const { container, controller: video } = mountHost(
    (host) => new VideoController(host),
    (video) => renderCard(story, video, { ...options, onSelect, ...extra }),
  );

  const card = container.querySelector<HTMLElement>(".card");
  const sound = () => card?.querySelector<HTMLButtonElement>(".card-sound");
  return { card, video, sound, onSelect };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("renderCard", () => {
  it("has the cover and a button with a play icon", () => {
    const { card } = mount({ poster_url: "https://example.com/cover.jpg" });
    const open = card?.querySelector(".card-open");

    expect(card?.querySelector(".poster")?.getAttribute("src")).toBe(
      "https://example.com/cover.jpg",
    );
    // A native button: Enter and Space click it.
    expect(open).toBeInstanceOf(HTMLButtonElement);
    expect(open?.getAttribute("type")).toBe("button");
    expect(open?.getAttribute("aria-label")).toBe("Assistir vídeo");
    expect(open?.querySelector(".play")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(open?.querySelector(".play svg.icon")).not.toBeNull();
  });

  it("calls onSelect when its button is clicked", () => {
    const { card, onSelect } = mount({});

    card?.querySelector<HTMLButtonElement>(".card-open")?.click();

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("renderCard sound button", () => {
  const story = { media_url: "https://example.com/story.mp4" };

  beforeAll(() => {
    installMediaMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The card's video playing, as its autoplay does in browsers.
  function mountPlaying() {
    const result = mount(story);
    result.video.play();
    return result;
  }

  it("turns the video's sound on and off", () => {
    const { card, sound } = mountPlaying();
    const video = card?.querySelector("video");
    expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
    expect(sound()?.querySelectorAll("svg.icon")).toHaveLength(1);

    sound()?.click();
    expect(video?.muted).toBe(false);
    expect(sound()?.getAttribute("aria-label")).toBe("Desativar som");
    expect(sound()?.querySelectorAll("svg.icon")).toHaveLength(1);

    sound()?.click();
    expect(video?.muted).toBe(true);
    expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
  });

  it("does not open the player", () => {
    const { sound, onSelect } = mountPlaying();

    sound()?.click();

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is beside the card's button, not inside it", () => {
    const { card, sound } = mountPlaying();

    expect(sound()?.parentElement).toBe(card);
    expect(sound()?.closest(".card-open")).toBeNull();
  });

  it("is only there while the video plays", () => {
    const { video, sound } = mount(story);
    // Not yet playing, or autoplay blocked (iOS Low Power Mode).
    expect(sound()).toBeNull();

    video.play();
    expect(sound()).not.toBeNull();

    // Paused behind the open player.
    video.pause();
    expect(sound()).toBeNull();
  });

  it("is not there for people who prefer reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
    }));
    const { card, sound } = mount(story);

    // The video doesn't autoplay, so it has no sound to turn on.
    expect(card?.querySelector("video")?.autoplay).toBe(false);
    expect(sound()).toBeNull();
  });

  it("is only there for a card with a video", () => {
    expect(mount({}).sound()).toBeNull();
  });

  it("is removed when the video fails to load", () => {
    const { card, sound } = mountPlaying();
    expect(sound()).not.toBeNull();
    card?.querySelector("video")?.dispatchEvent(new Event("error"));

    expect(card?.querySelector("video")).toBeNull();
    expect(sound()).toBeNull();
  });
});

describe("renderCard failed video", () => {
  beforeAll(() => {
    installMediaMocks();
  });

  it("says the video is unavailable, without a retry or play icon", () => {
    const { card } = mount({
      poster_url: "https://example.com/cover.jpg",
      media_url: "https://example.com/story.mp4",
    });
    card?.querySelector("video")?.dispatchEvent(new Event("error"));

    const status = card?.querySelector(".media-status");
    expect(status?.textContent?.trim()).toBe("Vídeo indisponível");
    expect(status?.querySelector("svg.icon")).not.toBeNull();
    expect(card?.querySelector(".media-retry")).toBeNull();
    expect(card?.querySelector(".play")).toBeNull();
    expect(card?.querySelector(".poster")).not.toBeNull();
    const notice = card?.querySelector(".media-notice");
    expect(notice?.getAttribute("role")).toBeNull();
    expect(notice?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("renderCard call to action", () => {
  const story = { media_url: "https://example.com/story.mp4" };
  const cta = { label: "Saiba mais", url: "https://www.example.com/campaign" };

  beforeAll(() => {
    installMediaMocks();
  });

  // The card's video playing with the sound on.
  function mountWithSound(extra?: Partial<CardOptions>) {
    const result = mount(story, { cta, ...extra });
    result.video.play();
    result.sound()?.click();
    const video = result.card?.querySelector("video");
    const link = result.card?.querySelector<HTMLAnchorElement>(".card-cta");
    if (!video || !link) throw new Error("The video or the link is missing");
    // The test doesn't navigate.
    link.addEventListener("click", (event) => event.preventDefault());
    expect(video.muted).toBe(false);
    return { ...result, video, link };
  }

  it("mutes the video and keeps it playing when the link opens", () => {
    const { video, link, sound } = mountWithSound();

    link.click();

    expect(video.muted).toBe(true);
    expect(video.paused).toBe(false);
    expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
  });

  it("leaves the sound on when the link opens in the background", () => {
    const { video, link } = mountWithSound();

    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        metaKey: true,
      }),
    );

    expect(video.muted).toBe(false);
  });

  it("keeps a muted video muted and playing when the link opens", () => {
    const { card, video: controller } = mount(story, { cta });
    controller.play();
    const video = card?.querySelector("video");
    const link = card?.querySelector<HTMLAnchorElement>(".card-cta");
    if (!video || !link) throw new Error("The video or the link is missing");
    // The test doesn't navigate.
    link.addEventListener("click", (event) => event.preventDefault());
    expect(video.muted).toBe(true);

    link.click();

    expect(video.muted).toBe(true);
    expect(video.paused).toBe(false);
  });

  it("leaves a paused video paused when the link opens", () => {
    const { card } = mount(story, { cta });
    const video = card?.querySelector("video");
    const link = card?.querySelector<HTMLAnchorElement>(".card-cta");
    if (!video || !link) throw new Error("The video or the link is missing");
    // The test doesn't navigate.
    link.addEventListener("click", (event) => event.preventDefault());
    expect(video.paused).toBe(true);

    link.click();

    expect(video.paused).toBe(true);
  });

  it("leaves the sound on when onCtaSelect takes the click", () => {
    const onCtaSelect = vi.fn();
    const { video, link } = mountWithSound({ onCtaSelect });

    link.click();

    expect(onCtaSelect).toHaveBeenCalledOnce();
    expect(video.muted).toBe(false);
  });
});

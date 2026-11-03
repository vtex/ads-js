import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { installMediaMocks } from "./media.mock";
import { createCard } from "./card";

describe("createCard", () => {
  it("renders the poster", () => {
    const card = createCard({
      poster_url: "https://example.com/cover.jpg",
    });

    const poster = card.querySelector<HTMLImageElement>(".poster");
    expect(poster?.src).toBe("https://example.com/cover.jpg");
    expect(poster?.alt).toBe("");
  });

  it("renders no poster without a poster_url", () => {
    const card = createCard({});
    expect(card.querySelector(".poster")).toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "/stories/cover.jpg",
    "//attacker.example/cover.jpg",
  ])(
    "ignores a poster_url that is not an absolute http(s) URL: %s",
    (posterUrl) => {
      const card = createCard({ poster_url: posterUrl });
      expect(card.querySelector(".poster")).toBeNull();
    },
  );
});

describe("createCard with options", () => {
  function interactiveCard() {
    const onSelect = vi.fn();
    const card = createCard(
      {},
      {
        label: "Assistir vídeo",
        soundOnLabel: "Ativar som",
        soundOffLabel: "Desativar som",
        onSelect,
      },
    );
    return { card, onSelect };
  }

  it("is a focusable button with a play icon", () => {
    const { card } = interactiveCard();

    expect(card.getAttribute("role")).toBe("button");
    expect(card.getAttribute("aria-label")).toBe("Assistir vídeo");
    expect(card.tabIndex).toBe(0);
    expect(card.querySelector(".play")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(card.querySelector(".play svg.icon")).not.toBeNull();
  });

  it("calls onSelect on click, Enter and Space", () => {
    const { card, onSelect } = interactiveCard();

    card.click();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it("is not a button without options", () => {
    const card = createCard({});

    expect(card.getAttribute("role")).toBeNull();
    expect(card.querySelector(".play")).toBeNull();
  });
});

describe("createCard with a video", () => {
  const story = {
    poster_url: "https://example.com/cover.jpg",
    media_url: "https://example.com/story.mp4",
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loops the video muted and inline over the cover", () => {
    const card = createCard(story);

    const video = card.querySelector("video");
    expect(video?.getAttribute("src")).toBe("https://example.com/story.mp4");
    expect(video?.getAttribute("poster")).toBe("https://example.com/cover.jpg");
    expect(video?.muted).toBe(true);
    expect(video?.hasAttribute("muted")).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.autoplay).toBe(true);
    // The cover stays underneath for when the video can't play.
    expect(card.querySelector(".poster")).not.toBeNull();
  });

  it("does not autoplay for people who prefer reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
    }));

    const video = createCard(story).querySelector("video");
    expect(video?.autoplay).toBe(false);
  });

  it("removes the video when it fails to load, leaving the cover", () => {
    const card = createCard(story);
    card.querySelector("video")?.dispatchEvent(new Event("error"));

    expect(card.querySelector("video")).toBeNull();
    expect(card.querySelector(".poster")).not.toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "data:video/mp4;base64,AAAA",
    "/stories/story.mp4",
    "//attacker.example/story.mp4",
  ])(
    "ignores a media_url that is not an absolute http(s) URL: %s",
    (mediaUrl) => {
      const card = createCard({ ...story, media_url: mediaUrl });
      expect(card.querySelector("video")).toBeNull();
    },
  );
});

describe("createCard sound button", () => {
  const options = {
    label: "Assistir vídeo",
    soundOnLabel: "Ativar som",
    soundOffLabel: "Desativar som",
  };
  const story = { media_url: "https://example.com/story.mp4" };

  beforeAll(() => {
    installMediaMocks();
  });

  function setup() {
    const onSelect = vi.fn();
    const card = createCard(story, { ...options, onSelect });
    const video = card.querySelector("video");
    const sound = card.querySelector<HTMLButtonElement>(".card-sound");
    return { card, video, sound, onSelect };
  }

  it("turns the video's sound on and off", () => {
    const { video, sound } = setup();
    expect(sound?.getAttribute("aria-label")).toBe("Ativar som");
    expect(sound?.querySelectorAll("svg.icon")).toHaveLength(1);

    sound?.click();
    expect(video?.muted).toBe(false);
    expect(sound?.getAttribute("aria-label")).toBe("Desativar som");

    sound?.click();
    expect(video?.muted).toBe(true);
    expect(sound?.getAttribute("aria-label")).toBe("Ativar som");
  });

  it("does not open the player", () => {
    const { sound, onSelect } = setup();

    sound?.click();
    sound?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is only there for a card with a video", () => {
    const withoutVideo = createCard({}, { ...options, onSelect: vi.fn() });
    expect(withoutVideo.querySelector(".card-sound")).toBeNull();

    const inPlayer = createCard(story);
    expect(inPlayer.querySelector(".card-sound")).toBeNull();
  });

  it("is removed when the video fails to load", () => {
    const { card, video } = setup();
    video?.dispatchEvent(new Event("error"));

    expect(card.querySelector(".card-sound")).toBeNull();
  });
});

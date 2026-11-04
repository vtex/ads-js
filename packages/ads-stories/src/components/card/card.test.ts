import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { mountHost } from "../host.mock";
import { installMediaMocks } from "../media/media.mock";
import { VideoController } from "../media";
import { renderCard } from "./card";
import type { StoryMedia } from "../../types";

const options = {
  label: "Assistir vídeo",
  soundOnLabel: "Ativar som",
  soundOffLabel: "Desativar som",
};

function mount(story: StoryMedia) {
  const onSelect = vi.fn();
  const { container, controller: video } = mountHost(
    (host) => new VideoController(host),
    (video) => renderCard(story, video, { ...options, onSelect }),
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

  it("turns the video's sound on and off", () => {
    const { card, sound } = mount(story);
    const video = card?.querySelector("video");
    expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
    expect(sound()?.querySelectorAll("svg.icon")).toHaveLength(1);

    sound()?.click();
    video?.dispatchEvent(new Event("volumechange"));
    expect(video?.muted).toBe(false);
    expect(sound()?.getAttribute("aria-label")).toBe("Desativar som");
    expect(sound()?.querySelectorAll("svg.icon")).toHaveLength(1);

    sound()?.click();
    video?.dispatchEvent(new Event("volumechange"));
    expect(video?.muted).toBe(true);
    expect(sound()?.getAttribute("aria-label")).toBe("Ativar som");
  });

  it("does not open the player", () => {
    const { sound, onSelect } = mount(story);

    sound()?.click();

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is beside the card's button, not inside it", () => {
    const { card, sound } = mount(story);

    expect(sound()?.parentElement).toBe(card);
    expect(sound()?.closest(".card-open")).toBeNull();
  });

  it("is only there for a card with a video", () => {
    expect(mount({}).sound()).toBeNull();
  });

  it("is removed when the video fails to load", () => {
    const { card, sound } = mount(story);
    card?.querySelector("video")?.dispatchEvent(new Event("error"));

    expect(card?.querySelector("video")).toBeNull();
    expect(sound()).toBeNull();
  });
});

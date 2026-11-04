import { cardStyles, createCard, playVideo } from "../components/card";
import {
  createPlayer,
  playerStyles,
  playPlayer,
  showPlayer,
} from "../components/player";
import type { StoryMedia } from "../types";

export const TAG_NAME = "vtex-ads-story";

// Keeps the module importable where HTMLElement doesn't exist (SSR, Node).
const BaseElement: typeof HTMLElement = globalThis.HTMLElement ?? Object;

const styles = `
  :host {
    display: block;
    font-family: var(--vtex-ads-story-font-family, inherit);
    color: var(--vtex-ads-story-color-text, inherit);
  }
  ${cardStyles}
  ${playerStyles}
`;

// Temporary: rendered until the element reads Stories from the ad API.
const PLACEHOLDER_STORY: StoryMedia = {
  poster_url: "https://dummyimage.com/1080x1920/e31c57/fff",
  media_url: "https://samplelib.com/mp4/sample-10s-vp9.mp4",
};

// Temporary: fixed texts until the store can set them by attribute.
const LABELS = {
  watch: "Assistir vídeo",
  player: "Vídeo",
  expand: "Expandir vídeo",
  collapse: "Reduzir vídeo",
  close: "Fechar vídeo",
  play: "Reproduzir vídeo",
  pause: "Pausar vídeo",
  soundOn: "Ativar som",
  soundOff: "Desativar som",
};

export class VtexAdsStoryElement extends BaseElement {
  private player: HTMLDialogElement | null = null;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.closePlayer();
  };

  private render() {
    const container = this.shadowRoot?.querySelector(".root");
    if (!container) return;

    container.replaceChildren(
      createCard(PLACEHOLDER_STORY, {
        label: LABELS.watch,
        soundOnLabel: LABELS.soundOn,
        soundOffLabel: LABELS.soundOff,
        onSelect: () => this.openPlayer(),
      }),
    );
  }

  private cardVideo() {
    return this.shadowRoot?.querySelector<HTMLVideoElement>(
      ".root .card video",
    );
  }

  private openPlayer() {
    if (this.player || !this.shadowRoot) return;

    this.player = createPlayer(PLACEHOLDER_STORY, {
      label: LABELS.player,
      expandLabel: LABELS.expand,
      collapseLabel: LABELS.collapse,
      closeLabel: LABELS.close,
      playLabel: LABELS.play,
      pauseLabel: LABELS.pause,
      soundOnLabel: LABELS.soundOn,
      soundOffLabel: LABELS.soundOff,
      onClose: () => this.closePlayer(),
    });
    this.shadowRoot.append(this.player);
    showPlayer(this.player);
    // While the player is open, the card behind it stops on its cover.
    this.cardVideo()?.pause();
    playPlayer(this.player);
    document.addEventListener("keydown", this.onKeyDown);

    this.player.querySelector<HTMLElement>(".player-close")?.focus();
  }

  // `removed`: the element is leaving the page, so there is no card to give
  // focus back to or to resume playing (it would play out of sight).
  private closePlayer({ removed = false } = {}) {
    if (!this.player) return;

    document.removeEventListener("keydown", this.onKeyDown);
    this.player.remove();
    this.player = null;
    if (removed) return;

    const video = this.cardVideo();
    if (video?.autoplay) playVideo(video);

    this.shadowRoot?.querySelector<HTMLElement>(".root .card-open")?.focus();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${styles}</style><div class="root"></div>`;
    }

    this.render();
  }

  disconnectedCallback() {
    this.closePlayer({ removed: true });
  }
}

// Types `document.createElement("vtex-ads-story")` and `querySelector` results
// as VtexAdsStoryElement in any TypeScript project, no framework needed.
declare global {
  interface HTMLElementTagNameMap {
    "vtex-ads-story": VtexAdsStoryElement;
  }
}

export function defineVtexAdsStories() {
  if (typeof customElements === "undefined") return;
  if (customElements.get(TAG_NAME)) return;

  customElements.define(TAG_NAME, VtexAdsStoryElement);
}

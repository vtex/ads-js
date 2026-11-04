import { css, html, LitElement } from "lit";
import { cardStyles, renderCard } from "../components/card";
import { VideoController } from "../components/media";
import { PlayerController, playerStyles } from "../components/player";
import type { StoryMedia } from "../types";

export const TAG_NAME = "vtex-ads-story";

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

// LitElement is importable where HTMLElement doesn't exist (SSR, Node): Lit
// falls back to a minimal shim there.
export class VtexAdsStoryElement extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
        font-family: var(--vtex-ads-story-font-family, inherit);
        color: var(--vtex-ads-story-color-text, inherit);
      }
    `,
    cardStyles,
    playerStyles,
  ];

  private readonly cardVideo = new VideoController(this);

  private readonly player = new PlayerController(this, {
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

  private openPlayer() {
    if (this.player.isOpen) return;

    // While the player is open, the card behind it stops on its cover.
    this.cardVideo.pause();
    void this.player.open();
  }

  // The player also closes on its own when the element leaves the page,
  // without this: there is no card to give focus back to or to resume playing
  // (it would play out of sight).
  private closePlayer() {
    if (!this.player.isOpen) return;

    this.player.close();
    this.cardVideo.resume();
    this.renderRoot.querySelector<HTMLElement>(".root .card-open")?.focus();
  }

  protected render() {
    return html`
      <div class="root">
        ${renderCard(PLACEHOLDER_STORY, this.cardVideo, {
          label: LABELS.watch,
          soundOnLabel: LABELS.soundOn,
          soundOffLabel: LABELS.soundOff,
          onSelect: () => this.openPlayer(),
        })}
      </div>
      ${this.player.render(PLACEHOLDER_STORY)}
    `;
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

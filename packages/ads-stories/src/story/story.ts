import { cardStyles, createCard } from "../components/card";
import { createPlayer, playerStyles } from "../components/player";
import type { StoryAd } from "../types";

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
const PLACEHOLDER_STORY: StoryAd = {
  ad_id: "placeholder",
  poster_url: "https://dummyimage.com/1080x1920/e31c57/fff",
};

// Temporary: fixed texts until the store can set them by attribute.
const LABELS = {
  watch: "Assistir vídeo",
  player: "Vídeo",
  expand: "Expandir vídeo",
  collapse: "Reduzir vídeo",
  close: "Fechar vídeo",
};

export class VtexAdsStoryElement extends BaseElement {
  private player: HTMLElement | null = null;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.closePlayer();
  };

  private render() {
    const container = this.shadowRoot?.querySelector(".root");
    if (!container) return;

    container.replaceChildren(
      createCard(PLACEHOLDER_STORY, {
        label: LABELS.watch,
        onSelect: () => this.openPlayer(),
      }),
    );
  }

  private openPlayer() {
    if (this.player || !this.shadowRoot) return;

    this.player = createPlayer(PLACEHOLDER_STORY, {
      label: LABELS.player,
      expandLabel: LABELS.expand,
      collapseLabel: LABELS.collapse,
      closeLabel: LABELS.close,
      onClose: () => this.closePlayer(),
    });
    this.shadowRoot.append(this.player);
    // Without popover support the player is still shown, as a fixed element.
    this.player.showPopover?.();
    document.addEventListener("keydown", this.onKeyDown);

    this.player.querySelector<HTMLElement>(".player-close")?.focus();
  }

  private closePlayer({ restoreFocus = true } = {}) {
    if (!this.player) return;

    document.removeEventListener("keydown", this.onKeyDown);
    this.player.remove();
    this.player = null;

    if (restoreFocus) {
      this.shadowRoot?.querySelector<HTMLElement>(".root .card")?.focus();
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${styles}</style><div class="root"></div>`;
    }

    this.render();
  }

  disconnectedCallback() {
    this.closePlayer({ restoreFocus: false });
  }
}

// Types `document.createElement("vtex-ads-story")` and `querySelector` results
// as VtexAdsStoryElement in any TypeScript project, no framework needed.
declare global {
  interface HTMLElementTagNameMap {
    "vtex-ads-story": VtexAdsStoryElement;
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

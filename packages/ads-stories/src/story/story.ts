import { cardStyles, createCard } from "../card";
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
`;

// Temporary: rendered until the element reads Stories from the ad API.
const PLACEHOLDER_STORY: StoryAd = {
  ad_id: "placeholder",
  poster_url: "https://dummyimage.com/1080x1920/e31c57/fff",
};

export class VtexAdsStoryElement extends BaseElement {
  private render() {
    const container = this.shadowRoot?.querySelector(".root");
    if (!container) return;

    container.replaceChildren(createCard(PLACEHOLDER_STORY));
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${styles}</style><div class="root"></div>`;
    }

    this.render();
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

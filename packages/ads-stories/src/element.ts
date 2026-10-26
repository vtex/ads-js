export const TAG_NAME = "vtex-ads-story";

// Keeps the module importable where HTMLElement doesn't exist (SSR, Node).
const BaseElement = (
  typeof HTMLElement === "undefined" ? class {} : HTMLElement
) as typeof HTMLElement;

const styles = `
  :host {
    display: block;
    font-family: var(--vtex-ads-story-font-family, inherit);
    color: var(--vtex-ads-story-color-text, inherit);
  }
`;

export class VtexAdsStoryElement extends BaseElement {
  connectedCallback() {
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${styles}</style><div part="root">Hello world</div>`;
  }
}

export function defineVtexAdsStories(tagName: string = TAG_NAME) {
  if (typeof customElements === "undefined") return;
  if (customElements.get(tagName)) return;

  customElements.define(tagName, VtexAdsStoryElement);
}

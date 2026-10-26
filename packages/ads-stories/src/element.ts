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

const DEFAULT_NAME = "world";

export class VtexAdsStoryElement extends BaseElement {
  static get observedAttributes() {
    return ["name"];
  }

  get name(): string {
    return this.getAttribute("name")?.trim() ?? "";
  }

  set name(value: string) {
    this.setAttribute("name", value);
  }

  private render() {
    const container = this.shadowRoot?.querySelector("[part='root']");
    if (!container) return;

    // textContent keeps the name as plain text (no HTML injection).
    container.textContent = `Hello ${this.name || DEFAULT_NAME}!`;
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${styles}</style><div part="root"></div>`;
    }

    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }
}

export function defineVtexAdsStories(tagName: string = TAG_NAME) {
  if (typeof customElements === "undefined") return;
  if (customElements.get(tagName)) return;

  customElements.define(tagName, VtexAdsStoryElement);
}

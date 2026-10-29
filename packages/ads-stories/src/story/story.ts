export const TAG_NAME = "vtex-ads-story";

// Keeps the module importable where HTMLElement doesn't exist (SSR, Node).
const BaseElement: typeof HTMLElement = globalThis.HTMLElement ?? Object;

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

    this.upgradeProperty("name");
    this.render();
  }

  // A property set before the element is defined (e.g. while the CDN script
  // loads) becomes an own property that shadows the class getter/setter.
  // Remove it and set it again so it goes through the setter.
  private upgradeProperty(prop: "name") {
    if (!Object.prototype.hasOwnProperty.call(this, prop)) return;

    const value = this[prop];
    Reflect.deleteProperty(this, prop);
    this[prop] = value;
  }

  attributeChangedCallback() {
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

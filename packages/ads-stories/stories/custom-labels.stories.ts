import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { elementArgTypes, renderElement, type ElementArgs } from "./template";

const TEXTS = { table: { category: "Texts" } };

const OPEN_THE_PANEL = html`Click the product on the card to open the player
with its panel: the add to cart and view product buttons.`;

const meta: Meta<ElementArgs> = {
  title: "Custom labels",
  args: { placement: "two_stories", inactiveAutoplay: false },
  argTypes: {
    ...elementArgTypes,
    lang: { ...elementArgTypes.lang, ...TEXTS },
    labelAddToCart: { ...elementArgTypes.labelAddToCart, ...TEXTS },
    labelViewProduct: { ...elementArgTypes.labelViewProduct, ...TEXTS },
    theme: { control: false },
  },
  render: renderElement,
};

export default meta;

type Story = StoryObj<ElementArgs>;

export const Portuguese: Story = {
  parameters: {
    note: html`No <code>lang</code>: the texts are in Portuguese, the default.
      ${OPEN_THE_PANEL}`,
  },
};

export const Spanish: Story = {
  args: { lang: "es-AR", currency: "ARS" },
  parameters: {
    note: html`With <code>lang="es-AR"</code> and <code>currency="ARS"</code>,
      the texts are in Spanish (<em>Agregar al carrito</em>,
      <em>Ver producto</em>) and the prices read <code>$ 129,90</code> instead
      of <code>R$ 129,90</code>. ${OPEN_THE_PANEL}`,
  },
};

export const English: Story = {
  args: { lang: "en-US", currency: "USD" },
  parameters: {
    note: html`With <code>lang="en-US"</code>, the texts are in English. Any
      language other than Portuguese, Spanish or English gets Portuguese.
      ${OPEN_THE_PANEL}`,
  },
};

export const StoreLabels: Story = {
  name: "Store's own labels",
  args: {
    lang: "es-AR",
    currency: "ARS",
    labelAddToCart: "Comprar",
    labelViewProduct: "Ver detalles",
  },
  parameters: {
    note: html`<code>label-add-to-cart</code> and
      <code>label-view-product</code> replace the panel's buttons; the other
      texts stay in the element's language. ${OPEN_THE_PANEL}`,
  },
};

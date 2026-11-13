import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { action } from "storybook/actions";
import type { StoryAddToCartEvent } from "../src";
import { elementArgTypes, renderElement, type ElementArgs } from "./template";

const onAddToCart = (event: StoryAddToCartEvent) => {
  const { sku, seller, quantity } = event.detail;
  action("vtex-ads-story:add-to-cart")({ sku, seller, quantity });
};

const meta: Meta<ElementArgs> = {
  title: "Commerce events",
  args: { placement: "two_stories", inactiveAutoplay: false },
  argTypes: { ...elementArgTypes, theme: { control: false } },
  render: (args, context) => html`
    <div @vtex-ads-story:add-to-cart=${onAddToCart}>
      ${renderElement(args, context)}
    </div>
  `,
};

export default meta;

type Story = StoryObj<ElementArgs>;

export const AddToCart: Story = {
  name: "Add to cart",
  parameters: {
    note: html`Click the product on the card to open the player with its panel,
      then <em>Add to cart</em>. The
      <code>vtex-ads-story:add-to-cart</code> event's <code>sku</code>,
      <code>seller</code> and <code>quantity</code> show in the Actions panel.
      The player stays open.`,
  },
};

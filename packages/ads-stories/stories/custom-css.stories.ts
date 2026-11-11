import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { elementArgTypes, renderElement, type ElementArgs } from "./template";

// The CSS variables of FR-W4, each one a control. An empty one is unset, so
// the element shows its default.
const VARIABLES = {
  "--vtex-ads-story-font-family": "text",
  "--vtex-ads-story-color-text": "color",
  "--vtex-ads-story-color-muted": "color",
  "--vtex-ads-story-color-surface": "color",
  "--vtex-ads-story-color-accent": "color",
  "--vtex-ads-story-color-accent-contrast": "color",
  "--vtex-ads-story-radius": "text",
} as const;

type Variable = keyof typeof VARIABLES;
type Args = ElementArgs & Partial<Record<Variable, string>>;

const isVariable = (name: string): name is Variable => name in VARIABLES;

const OPEN_THE_PANEL = html`Click the card to open the player, then the product
to open its panel: the panel, its buttons and the "from" price take the colors.`;

const meta: Meta<Args> = {
  title: "Custom CSS",
  args: { placement: "home_stories", inactiveAutoplay: false },
  argTypes: {
    ...Object.fromEntries(
      Object.entries(VARIABLES).map(([name, control]) => [
        name,
        { control, table: { category: "CSS variables" } },
      ]),
    ),
    ...elementArgTypes,
    theme: { control: false },
  },
  render: (args, context) => {
    const theme: Record<string, string> = {};
    const element: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(args)) {
      if (!isVariable(name)) element[name] = value;
      else if (value) theme[name] = String(value);
    }
    return renderElement({ ...(element as ElementArgs), theme }, context);
  },
  parameters: { note: OPEN_THE_PANEL },
};

export default meta;

type Story = StoryObj<Args>;

export const Defaults: Story = {
  parameters: {
    note: html`No variable set: every control empty shows the defaults.
    ${OPEN_THE_PANEL}`,
  },
};

export const Brand: Story = {
  args: {
    "--vtex-ads-story-font-family": "Georgia, serif",
    "--vtex-ads-story-color-text": "#3b1f2b",
    "--vtex-ads-story-color-muted": "#9c6b80",
    "--vtex-ads-story-color-surface": "#fff4f7",
    "--vtex-ads-story-color-accent": "#e31c57",
    "--vtex-ads-story-color-accent-contrast": "#fff",
    "--vtex-ads-story-radius": "40px",
  },
};

export const Dark: Story = {
  args: {
    "--vtex-ads-story-color-text": "#f5f5f5",
    "--vtex-ads-story-color-muted": "#a3a3a3",
    "--vtex-ads-story-color-surface": "#1f1f1f",
    "--vtex-ads-story-color-accent": "#ffd60a",
    "--vtex-ads-story-color-accent-contrast": "#1f1f1f",
  },
};

export const SoldOut: Story = {
  name: "Sold out, with a brand",
  args: {
    ...Brand.args,
    placement: "three_stories",
    accountName: "playground",
  },
  parameters: {
    note: html`The second Story's product is out of stock (after the 2 s
      Intelligent Search mock): open it in the player to see the disabled add to
      cart in <code>--vtex-ads-story-color-muted</code>.`,
  },
};

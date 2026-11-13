/*
 * The element as every story renders it, with the controls they share.
 */
import type { ArgTypes, StoryContext } from "@storybook/web-components-vite";
import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";
import type { StoryHydration } from "../src";

// The placements and accounts the mock in handlers.ts answers.
export const PLACEMENTS = [
  "home_stories",
  "two_stories",
  "three_stories",
  "four_stories",
  "slow_stories",
  "slow_media",
  "slow_media_timeout",
  "empty_stories",
  "video_error",
];
export const ACCOUNTS = ["playground", "playground-slow", "playground-error"];

export type ElementArgs = {
  publisherId: string;
  placement: string;
  accountName?: string;
  timeout?: number;
  hydrationTimeout?: number;
  lang?: string;
  currency?: string;
  labelAddToCart?: string;
  labelViewProduct?: string;
  inactiveAutoplay: boolean;
  slideDuration?: number;
  hydration?: StoryHydration;
  theme?: Record<string, string>;
};

export type Parameters = { note?: TemplateResult };

export const elementArgTypes: Partial<ArgTypes<ElementArgs>> = {
  publisherId: { name: "publisher-id", control: "text" },
  placement: {
    control: "text",
    description: `The mock answers: ${PLACEMENTS.join(", ")}. Any other gets the default Story.`,
  },
  accountName: {
    name: "account-name",
    control: "text",
    description: `The Intelligent Search mock answers: ${ACCOUNTS.join(", ")}. Empty: no Intelligent Search hydration.`,
  },
  timeout: { control: "number" },
  hydrationTimeout: { name: "hydration-timeout", control: "number" },
  lang: { control: "text" },
  currency: { control: "text" },
  labelAddToCart: { name: "label-add-to-cart", control: "text" },
  labelViewProduct: { name: "label-view-product", control: "text" },
  inactiveAutoplay: { name: "inactive-autoplay", control: "boolean" },
  slideDuration: { name: "slide-duration", control: "number" },
  hydration: { control: false },
};

// Keyed by the element's args: a change mounts a new element, as on a page
// load. A theme change restyles the element in place, so an open player stays
// open.
export const renderElement = (
  { theme, ...args }: ElementArgs,
  { parameters, globals }: Pick<StoryContext, "parameters" | "globals">,
) => html`
  <div class="story-container">
    ${(parameters as Parameters).note
      ? html`<p class="note">${(parameters as Parameters).note}</p>`
      : nothing}
    <div style=${styleMap(theme ?? {})}>
      ${keyed(
        JSON.stringify({ ...args, adApi: globals.adApi }),
        html`<vtex-ads-story-carousel
          publisher-id=${args.publisherId}
          session-id="playground-session"
          placement=${args.placement}
          account-name=${ifDefined(args.accountName?.trim() || undefined)}
          timeout=${ifDefined(args.timeout)}
          hydration-timeout=${ifDefined(args.hydrationTimeout)}
          lang=${ifDefined(args.lang)}
          currency=${ifDefined(args.currency)}
          label-add-to-cart=${ifDefined(args.labelAddToCart)}
          label-view-product=${ifDefined(args.labelViewProduct)}
          ?inactive-autoplay=${args.inactiveAutoplay}
          slide-duration=${ifDefined(args.slideDuration)}
          .hydration=${args.hydration}
        ></vtex-ads-story-carousel>`,
      )}
    </div>
  </div>
`;

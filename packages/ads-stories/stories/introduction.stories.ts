import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ACCOUNTS, PLACEMENTS } from "./template";

const DOCS = "https://vtex.github.io/ads-js/docs/ads-stories/quickstart";

const meta: Meta = {
  title: "Introduction",
  parameters: { layout: "padded", msw: [] },
};

export default meta;

export const Introduction: StoryObj = {
  name: "Welcome",
  render: () => html`
    <article class="intro">
      <h1>VTEX Ads Stories</h1>
      <p>
        <code>@vtex/ads-stories</code> is the VTEX Ads Stories web component,
        <code>&lt;vtex-ads-story-carousel&gt;</code>. It requests a placement's
        Stories from the ad API, shows them in a carousel whose cards open in a
        video player, sends their ad events and tells the store when a product
        is added to or removed from the cart.
      </p>
      <p>
        This Storybook is for this package only. For the React SDK, see the
        playground. To install and configure the element, read the
        <a href="${DOCS}" target="_blank" rel="noreferrer">quickstart</a>.
      </p>

      <h2>What is here</h2>
      <ul>
        <li>
          <strong>Story</strong>: the element in every state it can be in:
          different numbers of Stories, autoplay, reduced motion, slow or
          failing ad API and media, and product hydration.
        </li>
        <li>
          <strong>Custom CSS</strong>: the CSS variables a store sets to match
          its brand: colors, radius and the sold out look.
        </li>
        <li>
          <strong>Custom labels</strong>: the built-in languages and the texts a
          store overrides.
        </li>
        <li>
          <strong>Commerce events</strong>: the cart events the element emits
          for the store, logged as they happen.
        </li>
      </ul>

      <h2>How to use it</h2>
      <ul>
        <li>
          Change the element's attributes in the <strong>Controls</strong>
          panel under each story.
        </li>
        <li>
          The ad API is mocked by default. The placements it answers are
          ${PLACEMENTS.map(
            (placement, i) => html`${i ? ", " : ""}<code>${placement}</code>`,
          )},
          and the accounts are
          ${ACCOUNTS.map(
            (account, i) => html`${i ? ", " : ""}<code>${account}</code>`,
          )}.
        </li>
      </ul>

      <h2>Try it with a real store</h2>
      <p>To see a store's own Stories, point the element at its real ad API:</p>
      <ol>
        <li>
          In the toolbar, open <strong>Ad API</strong> and choose
          <strong>Production ad API</strong>. A warning shows above the story
          while it is on.
        </li>
        <li>
          Open any story, then in the <strong>Controls</strong> panel set
          <code>publisher-id</code> to the store's publisher id and
          <code>placement</code> to one of its Story placements.
        </li>
        <li>
          Optional: set <code>account-name</code> to the store's VTEX account to
          hydrate the products' prices and availability from Intelligent Search.
        </li>
      </ol>
      <p>
        These are real Stories, but their impressions, views and clicks are
        logged in the browser console and never sent, so they don't count for
        the advertiser. Switch <strong>Ad API</strong> back to
        <strong>Mocked ad API</strong> to return to the test Stories.
      </p>
    </article>
  `,
};

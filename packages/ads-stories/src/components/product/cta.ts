import { html } from "lit";
import { icon } from "../icons";
import { httpUrl } from "../../utils/http-url";
import type { StoryAd } from "../../types";

/** The call to action of a Story whose destination is a link. */
export interface CardCta {
  /** The button's text, from the campaign ("Saiba mais"). */
  label: string;
  /** The advertiser's link. */
  url: string;
}

/**
 * The call to action of a Story without a product (its destination is a
 * link), with the text set in the campaign. Undefined when the Story has a
 * product, no text or no http(s) destination.
 */
export function toCardCta(
  story: Pick<StoryAd, "product" | "destination_url" | "call_to_action">,
): CardCta | undefined {
  if (story.product) return undefined;

  const label = story.call_to_action?.trim();
  const url = httpUrl(story.destination_url);

  return label && url ? { label, url } : undefined;
}

/**
 * The call to action at the bottom of the card or the video: a glass pill
 * with the text and a caret, a link to the destination in a new tab. With
 * `onSelect`, a click calls it instead of following the link (a card
 * without the highlight takes it first).
 */
export function renderCta(cta: CardCta, onSelect?: () => void) {
  const onClick = onSelect
    ? (event: Event) => {
        event.preventDefault();
        onSelect();
      }
    : undefined;

  return html`
    <a
      class="card-cta"
      href=${cta.url}
      target="_blank"
      rel="noopener noreferrer"
      @click=${onClick}
    >
      <span class="cta-label">${cta.label}</span>
      ${icon("next")}
    </a>
  `;
}

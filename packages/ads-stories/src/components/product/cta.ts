import { html } from "lit";
import { icon } from "../icons";
import { destinationUrl } from "../../utils/safe-url";
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
 * product, no text or no http(s) or same-store path destination.
 */
export function toCardCta(
  story: Pick<StoryAd, "product" | "destination_url" | "call_to_action">,
): CardCta | undefined {
  if (story.product) return undefined;

  const label = story.call_to_action?.trim();
  const url = destinationUrl(story.destination_url);

  return label && url ? { label, url } : undefined;
}

export interface CtaOptions {
  /**
   * Called by a click instead of following the link (a card without the
   * highlight takes it first).
   */
  onSelect?: () => void;
  /**
   * Called by a click that follows the link, as it opens the new tab. Not
   * called when the tab opens in the background (see opensInBackground).
   */
  onOpen?: () => void;
}

/**
 * Whether a click on a link opens its tab in the background, the page staying
 * in front: Cmd (macOS) or Ctrl with the click. With Shift too, the new tab
 * comes to the front.
 */
const opensInBackground = (event: MouseEvent) =>
  (event.metaKey || event.ctrlKey) && !event.shiftKey;

/** Runs onOpen for a click that brings the new tab to the front. */
export function onForegroundOpen(onOpen?: () => void) {
  return onOpen
    ? (event: MouseEvent) => {
        if (!opensInBackground(event)) onOpen();
      }
    : undefined;
}

/**
 * The call to action at the bottom of the card or the video: a glass pill
 * with the text and a caret, a link to the destination in a new tab.
 */
export function renderCta(cta: CardCta, { onSelect, onOpen }: CtaOptions = {}) {
  const onClick = onSelect
    ? (event: Event) => {
        event.preventDefault();
        onSelect();
      }
    : onForegroundOpen(onOpen);

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

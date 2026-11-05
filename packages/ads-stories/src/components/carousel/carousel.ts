import { css, html, type TemplateResult } from "lit";

const STAGE_HEIGHT = css`500px`;
const SOLO_PADDING = css`24px`;

/**
 * The carousel stage: a band as tall as the card, as wide as the element's
 * parent. The store sets the width on its own container.
 *
 * With one Story, the card sits centered over a solid background
 * (--vtex-ads-story-solo-background, default #fafafa), with room around it:
 * the card shrinks to fit the padding and gets a soft shadow. On narrow
 * screens (576px or less, as in the prototype) there is no room for the
 * background, so the card shows alone at full height.
 */
export const carouselStyles = css`
  .carousel {
    position: relative;
    box-sizing: border-box;
    display: grid;
    height: ${STAGE_HEIGHT};
    place-items: center;
    --card-height: ${STAGE_HEIGHT};
  }

  .carousel[data-solo] {
    padding: ${SOLO_PADDING};
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: var(--vtex-ads-story-solo-background, #fafafa);
    --card-height: calc(${STAGE_HEIGHT} - 2 * ${SOLO_PADDING});
  }

  .carousel[data-solo] .card {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 576px) {
    .carousel[data-solo] {
      padding: 0;
      background: none;
      --card-height: ${STAGE_HEIGHT};
    }

    .carousel[data-solo] .card {
      box-shadow: none;
    }
  }
`;

/**
 * The carousel around the Story cards. Only one card for now: the one-Story
 * layout, with the card centered over the background.
 */
export function renderCarousel(card: TemplateResult) {
  return html`<div class="carousel" data-solo>${card}</div>`;
}

import { css, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { STAGE_HEIGHT, VISIBLE_SIDE } from "./carousel";

/**
 * While the covers and product photos load, the carousel is hidden under a
 * skeleton of the same layout, which then fades out. The skeleton's slides
 * have their own class, so they never count as the carousel's.
 */
export const carouselSkeletonStyles = css`
  .root {
    position: relative;
  }

  .root[data-requesting] {
    height: ${STAGE_HEIGHT};
  }

  .root[data-loading] .carousel {
    visibility: hidden;
  }

  .skeleton {
    position: absolute;
    inset: 0;
    z-index: 2;
    box-sizing: border-box;
    overflow: hidden;
    pointer-events: none;
    transition:
      opacity 0.3s ease,
      visibility 0s;
  }

  .skeleton[data-done] {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease,
      visibility 0s 0.3s;
  }

  .skeleton-slide {
    position: absolute;
    top: 0;
    left: 50%;
    width: calc(${STAGE_HEIGHT} * 9 / 16);
    height: 100%;
    margin-left: calc(${STAGE_HEIGHT} * 9 / -32);
    transform: translateX(calc(var(--place) * (100% + 8px))) scale(0.9);
  }

  .skeleton-slide[data-active] {
    transform: none;
  }

  .skeleton-card {
    width: 100%;
    height: 100%;
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: #ececec;
    animation: skeleton-pulse 1.2s ease-in-out infinite alternate;
  }

  .skeleton[data-done] .skeleton-card {
    animation: none;
  }

  @keyframes skeleton-pulse {
    to {
      background-color: #f6f6f6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton,
    .skeleton[data-done] {
      transition: none;
    }

    .skeleton-card {
      animation: none;
    }
  }
`;

/**
 * Placeholder for the carousel while it loads.
 * Decorative, so hidden from assistive technology. With `done`, it fades out
 * and stays out of sight.
 */
export function renderCarouselSkeleton({ done }: { done: boolean }) {
  const places = Array.from(
    { length: VISIBLE_SIDE * 2 + 1 },
    (_, i) => i - VISIBLE_SIDE,
  );

  return html`
    <div class="skeleton" aria-hidden="true" ?data-done=${done}>
      ${places.map(
        (place) => html`
          <div
            class="skeleton-slide"
            ?data-active=${place === 0}
            style=${styleMap({ "--place": String(place) })}
          >
            <div class="skeleton-card"></div>
          </div>
        `,
      )}
    </div>
  `;
}

import { css } from "lit";

export const productStyles = css`
  /* A glass pill at the bottom of the card, above its button: the product or
     the call to action. */
  .card-product,
  .card-cta {
    position: absolute;
    right: 12px;
    bottom: 12px;
    left: 12px;
    z-index: 1;
    display: flex;
    gap: 8px;
    align-items: center;
    box-sizing: border-box;
    padding: 8px;
    border: 0;
    border-radius: var(--vtex-ads-story-radius, 16px);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    color: #fff;
    font: inherit;
    text-align: left;
    isolation: isolate;
    transition: transform 0.2s ease;
  }

  /* The glass's tint and inner light, darker on hover. */
  .card-product::before,
  .card-cta::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.15);
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.42);
    content: "";
    transition: background-color 0.2s ease;
  }

  button.card-product,
  .card-cta {
    cursor: pointer;
  }

  .card-product:focus-visible,
  .card-cta:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .card-product:hover,
    .card-cta:hover {
      transform: translateY(-2px);
    }

    .card-product:hover::before,
    .card-cta:hover::before {
      background: rgba(0, 0, 0, 0.32);
    }
  }

  /* A Story with a link: the pill is the call to action, its text centered
     with a caret after it. */
  .card-cta {
    justify-content: center;
    gap: 6px;
    height: 48px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    text-decoration: none;
  }

  .cta-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-cta .icon {
    flex: none;
    width: 14px;
    height: 14px;
  }

  /* In the player: the pill is a toggle, with the actions panel below. */
  .product-expandable {
    display: block;
    padding: 0;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.2s ease;
  }

  .product-expandable::before {
    transition:
      opacity 0.3s ease,
      background-color 0.2s ease;
  }

  .product-summary {
    display: flex;
    gap: 8px;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 8px;
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: padding 0.3s ease;
  }

  .product-summary:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* The caret points up while closed and down while open. */
  .product-toggle {
    display: grid;
    flex: none;
    margin-right: 4px;
    opacity: 0.7;
    transition:
      transform 0.3s ease,
      opacity 0.2s ease;
  }

  .product-toggle .icon {
    width: 14px;
    height: 14px;
  }

  .product-summary:hover .product-toggle {
    opacity: 1;
  }

  /* Closed: 0 rows tall, so it grows smoothly when it opens. */
  .product-panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease;
  }

  .product-actions {
    display: grid;
    gap: 8px;
    min-height: 0;
    overflow: hidden;
    padding: 0 12px;
    opacity: 0;
    transition:
      padding 0.3s ease,
      opacity 0.2s ease;
  }

  .product-action {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 48px;
    padding: 0 16px;
    border: 1px solid var(--vtex-ads-story-color-accent, #1b75a8);
    border-radius: var(--vtex-ads-story-radius, 50px);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .product-action:focus-visible {
    outline: 2px solid var(--vtex-ads-story-color-accent, #1b75a8);
    outline-offset: 2px;
  }

  .product-add-to-cart {
    background: var(--vtex-ads-story-color-accent, #1b75a8);
    color: var(--vtex-ads-story-color-accent-contrast, #fff);
  }

  .product-add-to-cart:hover {
    background: color-mix(
      in srgb,
      var(--vtex-ads-story-color-accent, #1b75a8) 85%,
      #000
    );
  }

  /* In the cart: the add to cart button's pill, with minus and plus at its
     ends and the quantity between them. */
  .product-stepper {
    justify-content: space-between;
    padding: 0;
    background: var(--vtex-ads-story-color-accent, #1b75a8);
    color: var(--vtex-ads-story-color-accent-contrast, #fff);
    cursor: auto;
  }

  .product-stepper-button {
    display: grid;
    flex: none;
    place-items: center;
    width: 46px;
    height: 46px;
    padding: 0;
    border: 0;
    border-radius: var(--vtex-ads-story-radius, 50%);
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .product-stepper-button .icon {
    width: 18px;
    height: 18px;
  }

  .product-stepper-button:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  .product-stepper-button:focus-visible {
    outline: 2px solid var(--vtex-ads-story-color-accent-contrast, #fff);
    outline-offset: -4px;
  }

  .product-quantity {
    flex: 1;
    min-width: 0;
    font-size: 16px;
    text-align: center;
  }

  /* Sold out: add to cart, disabled and grayed. */
  .product-unavailable {
    border-color: transparent;
    background: rgba(0, 0, 0, 0.06);
    color: var(--vtex-ads-story-color-muted, #6b6b6b);
    cursor: not-allowed;
  }

  .product-view {
    background: var(--vtex-ads-story-color-surface, #fff);
    color: var(--vtex-ads-story-color-accent, #1b75a8);
  }

  /* A light tint of the accent. */
  .product-view:hover {
    background: color-mix(
      in srgb,
      var(--vtex-ads-story-color-accent, #1b75a8) 8%,
      var(--vtex-ads-story-color-surface, #fff)
    );
  }

  /* Open: a solid card (white by default), without the glass. */
  .product-expandable[data-open] {
    background: var(--vtex-ads-story-color-surface, #fff);
    color: var(--vtex-ads-story-color-text, #242424);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .product-expandable[data-open]::before {
    opacity: 0;
  }

  .product-expandable[data-open] .product-price {
    color: inherit;
  }

  .product-expandable[data-open] .product-list-price {
    color: var(--vtex-ads-story-color-muted, #6b6b6b);
    opacity: 1;
  }

  .product-expandable[data-open] .product-summary {
    padding: 12px;
  }

  .product-expandable[data-open] .product-toggle {
    transform: rotate(180deg);
  }

  .product-expandable[data-open] .product-panel {
    grid-template-rows: 1fr;
  }

  .product-expandable[data-open] .product-actions {
    padding: 0 12px 12px;
    opacity: 1;
    transition:
      padding 0.3s ease,
      opacity 0.25s ease 0.1s;
  }

  /* Open, it stays in place on hover. */
  @media (hover: hover) and (pointer: fine) {
    .product-expandable[data-open]:hover {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card-product,
    .card-product:hover,
    .card-cta,
    .card-cta:hover {
      transform: none;
      transition: none;
    }

    .card-product::before,
    .card-cta::before,
    .product-summary,
    .product-toggle,
    .product-panel,
    .product-actions,
    .product-expandable[data-open] .product-actions {
      transition: none;
    }
  }

  /* Its corners follow the pill's, 8px in from them: 8px by default. */
  .product-image {
    flex: none;
    width: 60px;
    height: 60px;
    border-radius: max(0px, calc(var(--vtex-ads-story-radius, 16px) - 8px));
    background: #fff;
    object-fit: contain;
  }

  .product-info {
    display: grid;
    flex: 1;
    gap: 4px;
    min-width: 0;
    font-size: 12px;
    font-weight: 700;
    line-height: 16px;
  }

  .product-name {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow-wrap: anywhere;
  }

  .product-price {
    display: flex;
    flex-wrap: wrap;
    gap: 0 6px;
  }

  .product-list-price {
    font-weight: 400;
    opacity: 0.5;
  }

  /* In place of the price, for a product that can't be bought. */
  .product-sold-out {
    font-weight: 700;
    opacity: 0.75;
  }

  /* Placeholders while the product loads, pulsing gently. */
  .product-loading {
    background: currentColor;
    opacity: 0.25;
    animation: product-loading-pulse 1.2s ease-in-out infinite alternate;
  }

  @keyframes product-loading-pulse {
    to {
      opacity: 0.1;
    }
  }

  /* The price's: a line its height (the info's line height). */
  .product-price-loading {
    width: 64px;
    height: 16px;
    border-radius: 4px;
  }

  /* The add to cart button's: its size and shape. */
  .product-add-to-cart-loading {
    display: block;
    height: 48px;
    border-radius: var(--vtex-ads-story-radius, 50px);
  }

  @media (prefers-reduced-motion: reduce) {
    .product-loading {
      animation: none;
    }
  }
`;

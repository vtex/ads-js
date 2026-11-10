import { css } from "lit";

export const productStyles = css`
  /* A glass pill at the bottom of the card, above its button. */
  .card-product {
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
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    color: #fff;
    font: inherit;
    text-align: left;
    isolation: isolate;
    transition: transform 0.2s ease;
  }

  /* The glass's tint and inner light, darker on hover. */
  .card-product::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.15);
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.42);
    content: "";
    transition: background-color 0.2s ease;
  }

  button.card-product {
    cursor: pointer;
  }

  .card-product:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .card-product:hover {
      transform: translateY(-2px);
    }

    .card-product:hover::before {
      background: rgba(0, 0, 0, 0.32);
    }
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
    border: 1px solid var(--vtex-ads-story-accent, #1b75a8);
    border-radius: 50px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .product-action:focus-visible {
    outline: 2px solid var(--vtex-ads-story-accent, #1b75a8);
    outline-offset: 2px;
  }

  .product-add-to-cart {
    background: var(--vtex-ads-story-accent, #1b75a8);
    color: #fff;
  }

  .product-add-to-cart:hover {
    background: color-mix(
      in srgb,
      var(--vtex-ads-story-accent, #1b75a8) 85%,
      #000
    );
  }

  .product-view {
    background: #fff;
    color: var(--vtex-ads-story-accent, #1b75a8);
  }

  /* A light tint of the accent. */
  .product-view:hover {
    background: color-mix(
      in srgb,
      var(--vtex-ads-story-accent, #1b75a8) 8%,
      #fff
    );
  }

  /* Open: a white card, without the glass. */
  .product-expandable[data-open] {
    background: #fff;
    color: #242424;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .product-expandable[data-open]::before {
    opacity: 0;
  }

  .product-expandable[data-open] .product-price {
    color: inherit;
  }

  .product-expandable[data-open] .product-list-price {
    color: #6b6b6b;
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
    .card-product:hover {
      transform: none;
      transition: none;
    }

    .card-product::before,
    .product-summary,
    .product-toggle,
    .product-panel,
    .product-actions,
    .product-expandable[data-open] .product-actions {
      transition: none;
    }
  }

  .product-image {
    flex: none;
    width: 60px;
    height: 60px;
    border-radius: 8px;
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
`;

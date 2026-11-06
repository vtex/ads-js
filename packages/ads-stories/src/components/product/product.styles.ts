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
    cursor: pointer;
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

  @media (prefers-reduced-motion: reduce) {
    .card-product,
    .card-product:hover {
      transform: none;
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

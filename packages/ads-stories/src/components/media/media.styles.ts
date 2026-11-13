import { css } from "lit";

export const mediaStyles = css`
  /* Over the cover when the video can't load or is loading again: a dimmed
     layer with the notice in the middle. Clicks go through to the card. */
  .media-status {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    text-align: center;
    pointer-events: none;
  }

  .media-status > * {
    animation: media-status-in 0.4s ease-out both;
  }

  .media-status-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    max-width: 100%;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  .media-status-text .icon {
    width: 18px;
    height: 18px;
  }

  .media-status[data-retry] .media-status-text .icon {
    width: 24px;
    height: 24px;
  }

  .media-retry {
    min-height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: var(--vtex-ads-story-radius, 999px);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.42);
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    pointer-events: auto;
    animation-delay: 0.06s;
  }

  .media-retry:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .media-retry:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  /* It spins with reduced motion too: a still ring wouldn't read as
     loading. */
  .media-spinner {
    width: 24px;
    height: 24px;
    box-sizing: border-box;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: media-spin 0.8s linear infinite;
  }

  @keyframes media-status-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
  }

  @keyframes media-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-status > :not(.media-spinner) {
      animation: none;
    }
  }
`;

import type { StoryAd } from "../types";

export const cardStyles = `
  .card {
    position: relative;
    box-sizing: border-box;
    width: calc(500px * 9 / 16);
    height: 500px;
    overflow: hidden;
    border-radius: var(--vtex-ads-story-radius, 20px);
    background: #000;
  }

  .poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Only absolute http(s) URLs reach the DOM.
function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** A 9:16 card with the Story cover. */
export function createCard(story: StoryAd) {
  const card = document.createElement("div");
  card.className = "card";

  if (story.poster_url && isHttpUrl(story.poster_url)) {
    const poster = document.createElement("img");
    poster.className = "poster";
    poster.alt = "";
    poster.src = story.poster_url;
    card.append(poster);
  }

  return card;
}

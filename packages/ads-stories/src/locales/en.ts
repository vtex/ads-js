import type { StoryLabels } from "./types";

/** The texts in English. */
export const en: StoryLabels = {
  watch: "Watch video",
  show: "Show video",
  carousel: "Videos",
  carouselRole: "carousel",
  previous: "Previous video",
  next: "Next video",
  player: "Video",
  expand: "Expand video",
  collapse: "Collapse video",
  close: "Close video",
  play: "Play video",
  pause: "Pause video",
  soundOn: "Turn sound on",
  soundOff: "Turn sound off",
  addToCart: "Add to cart",
  unavailable: "Product unavailable",
  soldOut: "Sold out",
  viewProduct: "View product",
  product: (name, price, listPrice) => {
    if (price && listPrice) return `${name}, was ${listPrice}, now ${price}`;
    return price ? `${name}, ${price}` : name;
  },
  position: (label, index, count) =>
    count > 1 ? `${label} ${index + 1} of ${count}` : label,
};

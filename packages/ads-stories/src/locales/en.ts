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
  videoUnavailable: "Video unavailable",
  videoFailed: "Couldn't load the video",
  retry: "Try again",
  videoLoading: "Loading video",
  product: (name, price, listPrice, soldOut) => {
    let text = name;
    if (price && listPrice) text = `${name}, was ${listPrice}, now ${price}`;
    else if (price) text = `${name}, ${price}`;
    return soldOut ? `${text}, ${soldOut}` : text;
  },
  position: (label, index, count) =>
    count > 1 ? `${label} ${index + 1} of ${count}` : label,
};

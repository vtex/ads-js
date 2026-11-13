export interface StoryLabels {
  watch: string;
  show: string;
  carousel: string;
  carouselRole: string;
  previous: string;
  next: string;
  player: string;
  expand: string;
  collapse: string;
  close: string;
  play: string;
  pause: string;
  soundOn: string;
  soundOff: string;
  addToCart: string;
  unavailable: string;
  soldOut: string;
  viewProduct: string;
  /** Over the card's cover when its video can't load. */
  videoUnavailable: string;
  /** Over the player's cover when its video can't load. */
  videoFailed: string;
  /** While the player loads the video. */
  videoLoading: string;
  /** The player's button to load the video again. */
  retry: string;
  /**
   * The product button: "Tênis, de R$ 159,90 por R$ 129,90", followed by
   * `soldOut` when the product can't be bought.
   */
  product: (
    name: string,
    price?: string,
    listPrice?: string,
    soldOut?: string,
  ) => string;
  /** Tells the cards apart: "Mostrar vídeo 2 de 4". */
  position: (label: string, index: number, count: number) => string;
}

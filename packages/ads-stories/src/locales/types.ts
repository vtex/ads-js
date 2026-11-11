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
  /** The product button: "Tênis, de R$ 159,90 por R$ 129,90". */
  product: (name: string, price?: string, listPrice?: string) => string;
  /** Tells the cards apart: "Mostrar vídeo 2 de 4". */
  position: (label: string, index: number, count: number) => string;
}

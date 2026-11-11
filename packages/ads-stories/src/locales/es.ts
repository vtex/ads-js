import type { StoryLabels } from "./types";

/** The texts in Spanish. */
export const es: StoryLabels = {
  watch: "Ver video",
  show: "Mostrar video",
  carousel: "Videos",
  carouselRole: "carrusel",
  previous: "Video anterior",
  next: "Video siguiente",
  player: "Video",
  expand: "Ampliar video",
  collapse: "Reducir video",
  close: "Cerrar video",
  play: "Reproducir video",
  pause: "Pausar video",
  soundOn: "Activar sonido",
  soundOff: "Desactivar sonido",
  addToCart: "Agregar al carrito",
  unavailable: "Producto no disponible",
  soldOut: "Agotado",
  viewProduct: "Ver producto",
  product: (name, price, listPrice) => {
    if (price && listPrice)
      return `${name}, antes ${listPrice}, ahora ${price}`;
    return price ? `${name}, ${price}` : name;
  },
  position: (label, index, count) =>
    count > 1 ? `${label} ${index + 1} de ${count}` : label,
};

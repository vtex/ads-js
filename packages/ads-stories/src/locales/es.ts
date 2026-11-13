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
  videoUnavailable: "Video no disponible",
  videoFailed: "No se pudo cargar el video",
  retry: "Intentar de nuevo",
  videoLoading: "Cargando video",
  product: (name, price, listPrice, soldOut) => {
    let text = name;
    if (price && listPrice)
      text = `${name}, antes ${listPrice}, ahora ${price}`;
    else if (price) text = `${name}, ${price}`;
    return soldOut ? `${text}, ${soldOut}` : text;
  },
  position: (label, index, count) =>
    count > 1 ? `${label} ${index + 1} de ${count}` : label,
};

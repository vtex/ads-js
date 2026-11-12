import type { StoryLabels } from "./types";

/** The texts in Portuguese, the default. */
export const pt: StoryLabels = {
  watch: "Assistir vídeo",
  show: "Mostrar vídeo",
  carousel: "Vídeos",
  carouselRole: "carrossel",
  previous: "Vídeo anterior",
  next: "Próximo vídeo",
  player: "Vídeo",
  expand: "Expandir vídeo",
  collapse: "Reduzir vídeo",
  close: "Fechar vídeo",
  play: "Reproduzir vídeo",
  pause: "Pausar vídeo",
  soundOn: "Ativar som",
  soundOff: "Desativar som",
  addToCart: "Adicionar ao carrinho",
  unavailable: "Produto indisponível",
  soldOut: "Esgotado",
  viewProduct: "Ver produto",
  videoUnavailable: "Vídeo indisponível",
  videoFailed: "Não foi possível carregar o vídeo",
  retry: "Tentar de novo",
  videoLoading: "Carregando vídeo",
  product: (name, price, listPrice) => {
    if (price && listPrice) return `${name}, de ${listPrice} por ${price}`;
    return price ? `${name}, ${price}` : name;
  },
  position: (label, index, count) =>
    count > 1 ? `${label} ${index + 1} de ${count}` : label,
};

import { describe, expect, it } from "vitest";
import { labelsFor } from ".";

describe("labelsFor", () => {
  it("picks the texts by the locale's language", () => {
    expect(labelsFor("pt-BR").close).toBe("Fechar vídeo");
    expect(labelsFor("es-AR").close).toBe("Cerrar video");
    expect(labelsFor("es").close).toBe("Cerrar video");
    expect(labelsFor("EN-us").close).toBe("Close video");
  });

  it("falls back to Portuguese for another language", () => {
    expect(labelsFor("fr-FR").close).toBe("Fechar vídeo");
    expect(labelsFor("").close).toBe("Fechar vídeo");
    expect(labelsFor("constructor").close).toBe("Fechar vídeo");
  });

  it("puts the store's texts on top, trimmed", () => {
    const labels = labelsFor("es-AR", {
      addToCart: " Comprar ",
      viewProduct: "Detalles",
    });

    expect(labels.addToCart).toBe("Comprar");
    expect(labels.viewProduct).toBe("Detalles");
    expect(labels.close).toBe("Cerrar video");
  });

  it("keeps the default for a blank text", () => {
    expect(labelsFor("pt-BR", { addToCart: "  " }).addToCart).toBe(
      "Adicionar ao carrinho",
    );
  });

  it("reads the product and the card position in each language", () => {
    expect(labelsFor("pt-BR").product("Tênis", "R$ 1", "R$ 2")).toBe(
      "Tênis, de R$ 2 por R$ 1",
    );
    expect(labelsFor("es").product("Zapatilla", "$ 1", "$ 2")).toBe(
      "Zapatilla, antes $ 2, ahora $ 1",
    );
    expect(labelsFor("en").product("Shoe", "$1", "$2")).toBe(
      "Shoe, was $2, now $1",
    );
    expect(
      labelsFor("pt-BR").product("Tênis", "R$ 1", undefined, "Esgotado"),
    ).toBe("Tênis, R$ 1, Esgotado");
    expect(
      labelsFor("en").product("Shoe", undefined, undefined, "Sold out"),
    ).toBe("Shoe, Sold out");
    expect(labelsFor("en").position("Show video", 1, 4)).toBe(
      "Show video 2 of 4",
    );
    expect(labelsFor("en").position("Show video", 0, 1)).toBe("Show video");
  });
});

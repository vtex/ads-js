import { en } from "./en";
import { es } from "./es";
import { pt } from "./pt";
import type { StoryLabels } from "./types";

export type { StoryLabels } from "./types";
export { en } from "./en";
export { es } from "./es";
export { pt } from "./pt";

export interface StoryLabelOverrides {
  addToCart?: string;
  viewProduct?: string;
}

const BY_LANGUAGE = new Map<string, StoryLabels>([
  ["pt", pt],
  ["es", es],
  ["en", en],
]);

export function labelsFor(
  locale: string,
  overrides: StoryLabelOverrides = {},
): StoryLabels {
  const language = locale.split("-")[0].toLowerCase();
  const labels = BY_LANGUAGE.get(language) ?? pt;
  const addToCart = overrides.addToCart?.trim();
  const viewProduct = overrides.viewProduct?.trim();

  return {
    ...labels,
    ...(addToCart && { addToCart }),
    ...(viewProduct && { viewProduct }),
  };
}

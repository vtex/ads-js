/*! Icons from Phosphor Icons (https://phosphoricons.com), MIT License, Copyright (c) 2023 Phosphor Icons */

// SVG files as downloaded from Phosphor: regular weight, or the weight in the
// file name. They are bundled as text: `?raw` is handled by Vite in dev and
// tests, and by the raw plugin in tsup.config.ts.
import close from "./assets/close.svg?raw";
import collapse from "./assets/collapse.svg?raw";
import expand from "./assets/expand.svg?raw";
import play from "./assets/play-fill.svg?raw";

export const icons = { close, collapse, expand, play };

export type IconName = keyof typeof icons;

/** Renders a bundled icon. It is decorative: name the control around it. */
export function createIcon(name: IconName) {
  const template = document.createElement("template");
  template.innerHTML = icons[name];

  const svg = template.content.firstElementChild as SVGSVGElement;
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  return svg;
}

/*! Icons from Phosphor Icons (https://phosphoricons.com), MIT License, Copyright (c) 2023 Phosphor Icons */

import type { DirectiveResult } from "lit/directive.js";
import {
  unsafeHTML,
  type UnsafeHTMLDirective,
} from "lit/directives/unsafe-html.js";

// SVG files as downloaded from Phosphor: regular weight, or the weight in the
// file name. They are bundled as text: `?raw` is handled by Vite in dev and
// tests, and by the raw plugin in tsup.config.ts.
import close from "./assets/close.svg?raw";
import collapse from "./assets/collapse.svg?raw";
import expand from "./assets/expand.svg?raw";
import pause from "./assets/pause-fill.svg?raw";
import play from "./assets/play-fill.svg?raw";
import soundOff from "./assets/speaker-x-fill.svg?raw";
import soundOn from "./assets/speaker-high-fill.svg?raw";

export const icons = {
  close,
  collapse,
  expand,
  pause,
  play,
  soundOff,
  soundOn,
};

export type IconName = keyof typeof icons;

// Each file as markup, marked decorative once so every render reuses it.
const markup = Object.fromEntries(
  Object.entries(icons).map(([name, svg]) => [
    name,
    svg.replace(
      "<svg",
      '<svg class="icon" aria-hidden="true" focusable="false"',
    ),
  ]),
) as Record<IconName, string>;

/**
 * Renders a bundled icon in a Lit template. It is decorative: name the
 * control around it. The markup only ever comes from the bundled files.
 */
export function icon(
  name: IconName,
): DirectiveResult<typeof UnsafeHTMLDirective> {
  return unsafeHTML(markup[name]);
}

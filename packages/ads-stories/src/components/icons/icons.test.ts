import { describe, it, expect } from "vitest";
import { html, render } from "lit";
import { icon, icons, type IconName } from ".";

describe("icon", () => {
  it.each(Object.keys(icons) as IconName[])(
    "renders the %s icon as a decorative SVG",
    (name) => {
      const container = document.createElement("div");
      render(html`${icon(name)}`, container);

      const svgs = container.querySelectorAll("svg");
      expect(svgs).toHaveLength(1);
      const svg = svgs[0];
      expect(svg.getAttribute("viewBox")).toBe("0 0 256 256");
      expect(svg.getAttribute("fill")).toBe("currentColor");
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.getAttribute("focusable")).toBe("false");
      expect(svg.classList.contains("icon")).toBe(true);
    },
  );
});

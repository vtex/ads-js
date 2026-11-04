import { describe, it, expect } from "vitest";
import { createIcon, icons } from ".";

describe("createIcon", () => {
  it.each(Object.keys(icons) as (keyof typeof icons)[])(
    "renders the %s icon as a decorative SVG",
    (name) => {
      const svg = createIcon(name);

      expect(svg.tagName.toLowerCase()).toBe("svg");
      expect(svg.getAttribute("viewBox")).toBe("0 0 256 256");
      expect(svg.getAttribute("fill")).toBe("currentColor");
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.classList.contains("icon")).toBe(true);
    },
  );
});

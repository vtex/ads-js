import { describe, it, expect } from "vitest";
import {
  AUTO_ADVANCE_MS,
  MAX_SLIDE_DURATION_MS,
  MIN_SLIDE_DURATION_MS,
  toSlideDuration,
} from "./carousel";

describe("toSlideDuration", () => {
  it.each([
    [0, 0],
    [1, MIN_SLIDE_DURATION_MS],
    [MIN_SLIDE_DURATION_MS - 1, MIN_SLIDE_DURATION_MS],
    [MIN_SLIDE_DURATION_MS, MIN_SLIDE_DURATION_MS],
    [8000, 8000],
    [MAX_SLIDE_DURATION_MS, MAX_SLIDE_DURATION_MS],
    [MAX_SLIDE_DURATION_MS + 1, MAX_SLIDE_DURATION_MS],
    [2 ** 31, MAX_SLIDE_DURATION_MS],
    [undefined, AUTO_ADVANCE_MS],
    [NaN, AUTO_ADVANCE_MS],
    [-1, AUTO_ADVANCE_MS],
    [-Infinity, AUTO_ADVANCE_MS],
    [Infinity, AUTO_ADVANCE_MS],
  ])("turns %s into %s", (value, expected) => {
    expect(toSlideDuration(value)).toBe(expected);
  });
});

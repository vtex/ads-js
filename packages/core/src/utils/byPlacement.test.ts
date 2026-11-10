import { describe, it, expect } from "vitest";
import { fromPlacementEntries, mapByPlacement } from "./byPlacement";

describe("fromPlacementEntries", () => {
  it("turns the pairs into a record by placement", () => {
    expect(
      fromPlacementEntries([
        ["top", [1, 2]],
        ["bottom", [3]],
      ]),
    ).toEqual({ top: [1, 2], bottom: [3] });
  });

  it("returns an empty record without pairs", () => {
    expect(fromPlacementEntries([])).toEqual({});
  });
});

describe("mapByPlacement", () => {
  it("maps every ad, keeping the placements and the order", () => {
    expect(mapByPlacement({ top: [1, 2], bottom: [3] }, (n) => n * 10)).toEqual(
      { top: [10, 20], bottom: [30] },
    );
  });
});

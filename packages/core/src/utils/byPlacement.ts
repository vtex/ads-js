import { Placement } from "../clients/adServer";

/**
 * Turns `[placement, ads]` pairs into a record by placement.
 */
export const fromPlacementEntries = <T>(
  entries: [Placement, T[]][],
): Record<Placement, T[]> => {
  const record: Record<Placement, T[]> = {};
  for (const [placement, ads] of entries) {
    record[placement] = ads;
  }
  return record;
};

/**
 * Maps every ad of a record by placement, keeping the placements and the
 * ads' order.
 */
export const mapByPlacement = <A, B>(
  ads: Record<Placement, A[]>,
  map: (ad: A) => B,
): Record<Placement, B[]> => {
  const record: Record<Placement, B[]> = {};
  for (const [placement, placementAds] of Object.entries(ads)) {
    record[placement] = placementAds.map((ad) => map(ad));
  }
  return record;
};

import { describe, it, expectTypeOf } from "vitest";
import type { VtexAdsStoryCarouselProps } from "./react";

// Type checks (run by tsc): the JSX props of <vtex-ads-story-carousel>.
const required = {
  "publisher-id": "publisher-1",
  "session-id": "session-1",
  placement: "home_stories",
};

describe("VtexAdsStoryCarouselProps", () => {
  it("accepts the required attributes", () => {
    expectTypeOf(required).toExtend<VtexAdsStoryCarouselProps>();
  });

  it("accepts the optional attributes", () => {
    expectTypeOf({
      ...required,
      "user-id": "user-1",
      "account-name": "store",
      channel: "app" as const,
      timeout: 5000,
    }).toExtend<VtexAdsStoryCarouselProps>();
  });

  it("requires publisher-id, session-id and placement", () => {
    type Required = typeof required;
    expectTypeOf<
      Omit<Required, "publisher-id">
    >().not.toExtend<VtexAdsStoryCarouselProps>();
    expectTypeOf<
      Omit<Required, "session-id">
    >().not.toExtend<VtexAdsStoryCarouselProps>();
    expectTypeOf<
      Omit<Required, "placement">
    >().not.toExtend<VtexAdsStoryCarouselProps>();
  });

  it("rejects an unknown channel", () => {
    expectTypeOf({
      ...required,
      channel: "tv" as const,
    }).not.toExtend<VtexAdsStoryCarouselProps>();
  });
});

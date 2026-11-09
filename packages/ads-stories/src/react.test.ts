import { describe, it, expectTypeOf } from "vitest";
import type { VtexAdsStoryProps } from "./react";

// Type checks (run by tsc): the JSX props of <vtex-ads-story>.
const required = {
  "publisher-id": "publisher-1",
  "session-id": "session-1",
  placement: "home_stories",
};

describe("VtexAdsStoryProps", () => {
  it("accepts the required attributes", () => {
    expectTypeOf(required).toExtend<VtexAdsStoryProps>();
  });

  it("accepts the optional attributes", () => {
    expectTypeOf({
      ...required,
      "user-id": "user-1",
      "account-name": "store",
      channel: "app" as const,
      timeout: 5000,
    }).toExtend<VtexAdsStoryProps>();
  });

  it("requires publisher-id, session-id and placement", () => {
    type Required = typeof required;
    expectTypeOf<
      Omit<Required, "publisher-id">
    >().not.toExtend<VtexAdsStoryProps>();
    expectTypeOf<
      Omit<Required, "session-id">
    >().not.toExtend<VtexAdsStoryProps>();
    expectTypeOf<
      Omit<Required, "placement">
    >().not.toExtend<VtexAdsStoryProps>();
  });

  it("rejects an unknown channel", () => {
    expectTypeOf({
      ...required,
      channel: "tv" as const,
    }).not.toExtend<VtexAdsStoryProps>();
  });
});

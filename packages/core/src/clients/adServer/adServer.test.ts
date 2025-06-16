import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAds } from "./adServer";
import { httpClient } from "../httpClient"; // adjust import path
import { AdRequest, AdResponse } from "./types"; // adjust import path
import { baseUrl } from "./adServer";

vi.mock("../httpClient", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("getAds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const publisherId = "publisher-123";

  const args: AdRequest = {
    placements: {
      search_top_product: { quantity: 3, types: ["product"] },
    },
    session_id: "abc",
    user_id: "user-123",
    channel: "site",
    context: "search",
  };

  const mockedHttpClient = vi.mocked(httpClient, true);

  it("calls httpClient.post with publisherId and ad request args", async () => {
    const expectedResponse: AdResponse = {
      ads: [
        {
          ad_id: "ad1",
          product_sku: "sku123",
          click_url: "http://example.com/click",
          impression_url: "http://example.com/impression",
          view_url: "http://example.com/view",
          product_name: "Sample Product",
        },
      ],
    };

    mockedHttpClient.post.mockResolvedValue(expectedResponse);

    const result = await getAds(publisherId, args);

    expect(httpClient.post).toHaveBeenCalledWith(baseUrl, publisherId, args);
    expect(result).toEqual(expectedResponse);
  });

  it("throws if httpClient.post rejects", async () => {
    mockedHttpClient.post.mockRejectedValue(new Error("Network error"));

    await expect(getAds(publisherId, args)).rejects.toThrow("Network error");
  });
});

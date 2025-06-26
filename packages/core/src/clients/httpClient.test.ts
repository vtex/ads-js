import { describe, it, vi, expect, beforeEach } from "vitest";
import { httpClient } from "./httpClient";
import fetch from "cross-unfetch";

vi.mock("cross-unfetch", async () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }),
  };
});

describe("httpClient", () => {
  const baseUrl = "https://example.com";
  const path = "/some-path";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetch with GET method", async () => {
    await httpClient.get(baseUrl, path);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(path),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("calls fetch with POST method", async () => {
    const body = { foo: "bar" };
    await httpClient.post(baseUrl, path, body);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(path),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  it("calls fetch with PUT method", async () => {
    const body = { foo: "bar" };
    await httpClient.put(baseUrl, path, body);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(path),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  });

  it("calls fetch with DELETE method", async () => {
    await httpClient.delete(baseUrl, path);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(path),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

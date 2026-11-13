import { describe, it, expect } from "vitest";
import { destinationUrl, httpUrl } from "./safe-url";

describe("httpUrl", () => {
  it("keeps an absolute http(s) URL", () => {
    expect(httpUrl("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
    expect(httpUrl("http://cdn.example.com/a.jpg")).toBe(
      "http://cdn.example.com/a.jpg",
    );
  });

  it("is null for anything else", () => {
    for (const value of [
      undefined,
      "",
      "/a.jpg",
      "//cdn.example.com/a.jpg",
      "a.jpg",
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "ftp://cdn.example.com/a.jpg",
    ]) {
      expect(httpUrl(value)).toBeNull();
    }
  });
});

describe("destinationUrl", () => {
  it("keeps an absolute http(s) URL", () => {
    expect(destinationUrl("https://example.com/campaign")).toBe(
      "https://example.com/campaign",
    );
  });

  it("keeps a path on the store with its query and hash", () => {
    expect(destinationUrl("/campaign?a=1#top")).toBe("/campaign?a=1#top");
  });

  it("is null for a destination that isn't http(s) or a same-store path", () => {
    for (const value of [
      undefined,
      "",
      "javascript:alert(1)",
      "//evil.com",
      "/\\evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
      "/\r/evil.com",
      "/\r\n/evil.com",
      "/.//evil.com",
      "/a/..//evil.com",
      "campaign",
    ]) {
      expect(destinationUrl(value)).toBeNull();
    }
  });
});

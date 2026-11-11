import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendEvent } from "./send-event";

const URL = "https://events.example/v1/beacon/impression/token";

const beacon = () => vi.mocked(navigator.sendBeacon);

async function bodyOf(blob: unknown) {
  expect(blob).toBeInstanceOf(Blob);
  expect((blob as Blob).type).toBe("application/json");
  return JSON.parse(await (blob as Blob).text());
}

describe("sendEvent", () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null)));

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the session and user as JSON through the Beacon API", async () => {
    expect(sendEvent(URL, { sessionId: "s-1", userId: "u-1" })).toBe(true);

    expect(beacon()).toHaveBeenCalledOnce();
    const [url, blob] = beacon().mock.calls[0];
    expect(url).toBe(URL);
    expect(await bodyOf(blob)).toEqual({ session_id: "s-1", user_id: "u-1" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves user_id out when there is no user", async () => {
    sendEvent(URL, { sessionId: "s-1" });

    expect(await bodyOf(beacon().mock.calls[0][1])).toEqual({
      session_id: "s-1",
    });
  });

  it.each([
    ["refuses to queue it", () => beacon().mockReturnValue(false)],
    [
      "throws",
      () =>
        beacon().mockImplementation(() => {
          throw new TypeError("not allowed");
        }),
    ],
    [
      "has no Beacon API",
      () =>
        Object.defineProperty(navigator, "sendBeacon", { value: undefined }),
    ],
  ])("posts with a keepalive fetch when the browser %s", (_, setup) => {
    setup();

    expect(sendEvent(URL, { sessionId: "s-1" })).toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "s-1" }),
      keepalive: true,
      credentials: "omit",
    });
  });

  it("logs a failed fallback request without throwing", async () => {
    beacon().mockReturnValue(false);
    const error = new TypeError("fetch failed");
    fetchMock.mockRejectedValueOnce(error);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    sendEvent(URL, { sessionId: "s-1" });
    await new Promise((resolve) => setTimeout(resolve));

    expect(consoleError).toHaveBeenCalledWith(
      "[vtex-ads-story-carousel] Event request failed",
      { url: URL, error },
    );
    consoleError.mockRestore();
  });

  it.each([undefined, "", "/v1/beacon/click", "javascript:alert(1)", "nope"])(
    "sends nothing to %j",
    (url) => {
      expect(sendEvent(url, { sessionId: "s-1" })).toBe(false);
      expect(beacon()).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});

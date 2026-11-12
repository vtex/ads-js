import { beforeEach, vi } from "vitest";

// The element sends its impression, view and click beacons as it renders.
// jsdom has no Beacon API, so the fallback would reach the network: every
// test starts with a beacon that queues and goes nowhere. A test about the
// events reads or replaces this mock.
beforeEach(() => {
  Object.defineProperty(navigator, "sendBeacon", {
    configurable: true,
    writable: true,
    value: vi.fn(() => true),
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  StoryEventsController,
  VIEW_DURATION_MS,
  type StoryTarget,
} from "./events-controller";
import {
  deliverQueued,
  installIntersectionObserverMock,
  intersect,
  observed,
} from "./intersection-observer.mock";
import type { EventIdentity } from "../../utils/send-event";
import { mockStories } from "../../story/story.mock";

const stories = mockStories;

const beaconed = () =>
  vi.mocked(navigator.sendBeacon).mock.calls.map(([url]) => String(url));

/** With `views`, the elements shown also count toward their views. */
function setup(identity: Partial<EventIdentity>, { views = false } = {}) {
  let controller: ReactiveController | undefined;
  let targets: StoryTarget[] = [];
  const host: ReactiveControllerHost = {
    addController: (c) => (controller = c),
    removeController: () => undefined,
    // Renders at once, where lit renders a microtask later.
    requestUpdate: () => controller?.hostUpdated?.(),
    updateComplete: Promise.resolve(true),
  };
  new StoryEventsController(host, {
    identity: () => identity,
    impressionTargets: () => targets,
    viewTargets: () => (views ? targets : []),
  });
  controller?.hostConnected?.();
  return {
    /** Renders the host showing `shown`. */
    render: (shown: StoryTarget[] = targets) => {
      targets = shown;
      controller?.hostUpdated?.();
    },
    disconnect: () => controller?.hostDisconnected?.(),
    connect: () => controller?.hostConnected?.(),
  };
}

const cards = stories.map(
  (story) => [document.createElement("div"), story] as const,
);

describe("StoryEventsController", () => {
  beforeEach(() => {
    installIntersectionObserverMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("sends nothing without a session", () => {
    const { render } = setup({});

    render(cards.slice(0, 2));
    intersect(cards[0][0], 1);

    expect(beaconed()).toEqual([]);
  });

  it("stops watching the elements the host no longer shows", () => {
    const { render } = setup({ sessionId: "s-1" });

    render(cards.slice(0, 2));
    render([cards[2]]);
    intersect(cards[0][0], 1);
    intersect(cards[2][0], 1);

    expect(observed()).toEqual([]);
    expect(beaconed()).toEqual([stories[2].impression_url]);
  });

  it("watches nothing off the page, and the elements shown once it is back", () => {
    const { render, disconnect, connect } = setup({ sessionId: "s-1" });

    disconnect();
    render([cards[0]]);
    expect(observed()).toEqual([]);

    connect();
    expect(observed()).toEqual([cards[0][0]]);
    intersect(cards[0][0], 1);
    expect(beaconed()).toEqual([stories[0].impression_url]);
  });

  it("ignores an impression entry queued before it left the page", () => {
    const { render, disconnect } = setup({ sessionId: "s-1" });

    render([cards[0]]);
    disconnect();
    deliverQueued(cards[0][0], 1);

    expect(beaconed()).toEqual([]);
  });

  it("ignores a view entry queued before it left the page", () => {
    vi.useFakeTimers();
    const { render, disconnect, connect } = setup(
      { sessionId: "s-1" },
      { views: true },
    );

    render([cards[0]]);
    disconnect();
    deliverQueued(cards[0][0], 1);
    connect();
    vi.advanceTimersByTime(VIEW_DURATION_MS);

    expect(beaconed()).not.toContain(stories[0].view_url);
  });
});

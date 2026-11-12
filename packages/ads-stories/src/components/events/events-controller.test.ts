import { describe, it, expect, afterEach, vi } from "vitest";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { StoryEventsController } from "./events-controller";
import type { EventIdentity } from "../../utils/send-event";
import { mockStories } from "../../story/story.mock";

const stories = mockStories;

const beaconed = () =>
  vi.mocked(navigator.sendBeacon).mock.calls.map(([url]) => String(url));

function setup(identity: Partial<EventIdentity>) {
  let controller: ReactiveController | undefined;
  const host: ReactiveControllerHost = {
    addController: (c) => (controller = c),
    removeController: () => undefined,
    requestUpdate: () => undefined,
    updateComplete: Promise.resolve(true),
  };
  const events = new StoryEventsController(host, {
    identity: () => identity,
    viewTargets: () => [],
  });
  return { events, render: () => controller?.hostUpdated?.() };
}

describe("StoryEventsController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the impressions until a render has a session", () => {
    const identity: Partial<EventIdentity> = {};
    const { events, render } = setup(identity);

    events.impress(stories.slice(0, 2));
    render();
    expect(beaconed()).toEqual([]);

    identity.sessionId = "s-1";
    render();
    expect(beaconed()).toEqual([
      stories[0].impression_url,
      stories[1].impression_url,
    ]);

    render();
    expect(beaconed()).toHaveLength(2);
  });

  it("sends the latest Stories passed, not the replaced ones", () => {
    const identity: Partial<EventIdentity> = {};
    const { events, render } = setup(identity);

    events.impress(stories.slice(0, 2));
    render();
    events.impress([stories[2]]);
    identity.sessionId = "s-1";
    render();

    expect(beaconed()).toEqual([stories[2].impression_url]);
  });
});

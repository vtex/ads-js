import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { StoryAd } from "../../types";
import { sendEvent, type EventIdentity } from "../../utils/send-event";

export const VIEW_THRESHOLD = 0.5;
export const VIEW_DURATION_MS = 2000;

type EventKind = "impression" | "view" | "click";

const URL_FIELD = {
  impression: "impression_url",
  view: "view_url",
  click: "click_url",
} as const satisfies Record<EventKind, keyof StoryAd>;

/** An element that shows a Story, watched for the view. */
export type ViewTarget = readonly [element: Element, story: StoryAd];

export interface StoryEventsOptions {
  /**
   * The session and user the events are for, read when each one is sent.
   * Without a session, nothing is sent.
   */
  identity: () => Partial<EventIdentity>;
  /**
   * The elements on which a Story can be seen right now, read after every
   * render of the host. An element left out stops counting toward its view.
   */
  viewTargets: () => Iterable<ViewTarget>;
}

interface Watched {
  story: StoryAd;
  /** Last reported by the observer: at least VIEW_THRESHOLD on screen. */
  visible: boolean;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Sends a Story's impression, view and click URLs, each at most once per
 * Story and session (the ad API's `session_id`):
 *
 * - impression: when the Story is rendered in the carousel (impress());
 * - view: when one of its elements (see `viewTargets`) has stayed at least
 *   50% on screen for 2 continuous seconds, with the page visible;
 * - click: on the first touch on the Story (click()).
 *
 * Without IntersectionObserver, no view is sent. Leaving the page stops
 * the views counting; nothing sent is sent again on return.
 */
export class StoryEventsController implements ReactiveController {
  private readonly sent: Record<EventKind, Set<string>> = {
    impression: new Set(),
    view: new Set(),
    click: new Set(),
  };

  private pendingImpressions: readonly StoryAd[] = [];

  private observer?: IntersectionObserver;
  private readonly watched = new Map<Element, Watched>();

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: StoryEventsOptions,
  ) {
    host.addController(this);
  }

  hostConnected() {
    if (typeof IntersectionObserver === "function") {
      this.observer = new IntersectionObserver(this.onIntersect, {
        threshold: VIEW_THRESHOLD,
      });
    }
    globalThis.document?.addEventListener(
      "visibilitychange",
      this.onVisibilityChange,
    );
    // Moved on the page: the cards rendered before are still there, but lit
    // hands their refs back only after the controllers connect.
    this.host.updateComplete.then(() => this.syncViewTargets());
  }

  hostDisconnected() {
    globalThis.document?.removeEventListener(
      "visibilitychange",
      this.onVisibilityChange,
    );
    this.observer?.disconnect();
    this.observer = undefined;
    for (const watched of this.watched.values()) clearTimeout(watched.timer);
    this.watched.clear();
    // Stories that never rendered were never seen.
    this.pendingImpressions = [];
  }

  hostUpdated() {
    const stories = this.pendingImpressions;
    if (stories.length && this.options.identity().sessionId) {
      this.pendingImpressions = [];
      for (const story of stories) this.send("impression", story);
    }

    this.syncViewTargets();
  }

  /**
   * The Stories the host renders next: their impressions go out once that
   * render is done, or, without a session yet, after the first render that
   * has one. Replaces Stories passed before and not sent yet.
   */
  impress(stories: readonly StoryAd[]) {
    this.pendingImpressions = stories;
  }

  /** A touch on the Story: its click goes out, the first time only. */
  click(story: StoryAd) {
    this.send("click", story);
  }

  private key(sessionId: string, story: StoryAd) {
    return `${sessionId}|${story.ad_id}`;
  }

  private wasSent(kind: EventKind, story: StoryAd) {
    const { sessionId } = this.options.identity();
    return !!sessionId && this.sent[kind].has(this.key(sessionId, story));
  }

  private send(kind: EventKind, story: StoryAd) {
    const { sessionId, userId } = this.options.identity();
    if (!sessionId || this.wasSent(kind, story)) return;

    const success = sendEvent(story[URL_FIELD[kind]], { sessionId, userId });
    if (success) {
      this.sent[kind].add(this.key(sessionId, story));
    }
  }

  // Watches the elements the host shows now, and stops watching the others,
  // dropping the time they had on screen.
  private syncViewTargets() {
    const { observer } = this;
    if (!observer) return;

    const current = new Map<Element, StoryAd>();
    for (const [element, story] of this.options.viewTargets()) {
      if (!this.wasSent("view", story)) current.set(element, story);
    }

    for (const [element, watched] of this.watched) {
      if (current.get(element) !== watched.story) {
        this.unwatch(element, watched);
      }
    }

    for (const [element, story] of current) {
      if (this.watched.has(element)) continue;
      this.watched.set(element, { story, visible: false });
      observer.observe(element);
    }
  }

  private readonly onIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const watched = this.watched.get(entry.target);
      if (!watched) continue;

      watched.visible =
        entry.isIntersecting && entry.intersectionRatio >= VIEW_THRESHOLD;
      if (watched.visible) this.startTimer(watched);
      else this.stopTimer(watched);
    }
  };

  // A hidden page (another tab, minimized) breaks the 2 seconds: they start
  // over when it shows again.
  private readonly onVisibilityChange = () => {
    for (const watched of this.watched.values()) {
      if (document.hidden) this.stopTimer(watched);
      else if (watched.visible) this.startTimer(watched);
    }
  };

  private startTimer(watched: Watched) {
    if (watched.timer || globalThis.document?.hidden) return;
    watched.timer = setTimeout(() => {
      watched.timer = undefined;
      this.send("view", watched.story);
      // Its other elements no longer need watching.
      if (this.wasSent("view", watched.story)) this.unwatchStory(watched.story);
    }, VIEW_DURATION_MS);
  }

  private stopTimer(watched: Watched) {
    clearTimeout(watched.timer);
    watched.timer = undefined;
  }

  private unwatch(element: Element, watched: Watched) {
    this.stopTimer(watched);
    this.observer?.unobserve(element);
    this.watched.delete(element);
  }

  private unwatchStory(story: StoryAd) {
    for (const [element, watched] of this.watched) {
      if (watched.story.ad_id === story.ad_id) this.unwatch(element, watched);
    }
  }
}

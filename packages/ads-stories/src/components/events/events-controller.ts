import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { StoryAd } from "../../types";
import { sendEvent, type EventIdentity } from "../../utils/send-event";

export const IMPRESSION_THRESHOLD = 0.3;
export const VIEW_THRESHOLD = 0.5;
export const VIEW_DURATION_MS = 2000;

type EventKind = "impression" | "view" | "click";

const URL_FIELD = {
  impression: "impression_url",
  view: "view_url",
  click: "click_url",
} as const satisfies Record<EventKind, keyof StoryAd>;

/** An element that shows a Story, watched for its impression or view. */
export type StoryTarget = readonly [element: Element, story: StoryAd];

export interface StoryEventsOptions {
  /**
   * The session and user the events are for, read when each one is sent.
   * Without a session, nothing is sent.
   */
  identity: () => Partial<EventIdentity>;
  /**
   * The elements on which the shopper can see a Story right now, read after
   * every render of the host.
   */
  impressionTargets: () => Iterable<StoryTarget>;
  /**
   * The elements on which a Story can be watched right now, read after every
   * render of the host. An element left out stops counting toward its view.
   */
  viewTargets: () => Iterable<StoryTarget>;
}

interface Watched {
  story: StoryAd;
  /** Last reported by the observer: at least the threshold on screen. */
  visible: boolean;
  timer?: ReturnType<typeof setTimeout>;
}

/** The elements watched for one event, and the observer watching them. */
interface Watcher {
  kind: "impression" | "view";
  observer: IntersectionObserver;
  watched: Map<Element, Watched>;
}

/**
 * Sends a Story's impression, view and click URLs, each at most once per
 * Story and session (the ad API's `session_id`):
 *
 * - impression: when one of its elements (see `impressionTargets`) has at
 *   least 30% on screen;
 * - view: when one of its elements (see `viewTargets`) has stayed at least
 *   50% on screen for 2 continuous seconds, with the page visible;
 * - click: on the first touch on the Story (click()).
 *
 * Without IntersectionObserver, nothing tells what is on screen: every
 * element in `impressionTargets` sends its impression, and no view is sent.
 * Leaving the page stops the views counting; nothing sent is sent again on
 * return.
 */
export class StoryEventsController implements ReactiveController {
  private readonly sent: Record<EventKind, Set<string>> = {
    impression: new Set(),
    view: new Set(),
    click: new Set(),
  };

  private connected = false;
  private impressions?: Watcher;
  private views?: Watcher;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: StoryEventsOptions,
  ) {
    host.addController(this);
  }

  hostConnected() {
    this.connected = true;
    if (typeof IntersectionObserver === "function") {
      this.impressions = this.watcher("impression", IMPRESSION_THRESHOLD);
      this.views = this.watcher("view", VIEW_THRESHOLD);
    }
    globalThis.document?.addEventListener(
      "visibilitychange",
      this.onVisibilityChange,
    );
    // Moved on the page: the cards rendered before are still there, but lit
    // hands their refs back only after the controllers connect. The render
    // asked for here runs after that, and hostUpdated watches them.
    this.host.requestUpdate();
  }

  hostDisconnected() {
    this.connected = false;
    globalThis.document?.removeEventListener(
      "visibilitychange",
      this.onVisibilityChange,
    );
    for (const watcher of [this.impressions, this.views]) {
      watcher?.observer.disconnect();
      for (const watched of watcher?.watched.values() ?? []) {
        clearTimeout(watched.timer);
      }
      watcher?.watched.clear();
    }
    this.impressions = undefined;
    this.views = undefined;
  }

  hostUpdated() {
    if (this.connected) this.syncTargets();
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

  private watcher(kind: Watcher["kind"], threshold: number): Watcher {
    const watched = new Map<Element, Watched>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = watched.get(entry.target);
          if (!target) continue;

          target.visible =
            entry.isIntersecting && entry.intersectionRatio >= threshold;
          if (kind === "impression") {
            if (target.visible) this.sendWatched(watcher, target.story);
          } else if (target.visible) this.startTimer(target);
          else this.stopTimer(target);
        }
      },
      { threshold },
    );
    const watcher: Watcher = { kind, observer, watched };
    return watcher;
  }

  private syncTargets() {
    const impressionTargets = this.options.impressionTargets();
    if (this.impressions) {
      this.sync(this.impressions, impressionTargets);
    } else {
      for (const [, story] of impressionTargets) this.send("impression", story);
    }
    this.sync(this.views, this.options.viewTargets());
  }

  // Watches the elements the host shows now, and stops watching the others,
  // dropping the time they had on screen.
  private sync(watcher: Watcher | undefined, targets: Iterable<StoryTarget>) {
    if (!watcher) return;

    const current = new Map<Element, StoryAd>();
    for (const [element, story] of targets) {
      if (!this.wasSent(watcher.kind, story)) current.set(element, story);
    }

    for (const [element, watched] of watcher.watched) {
      if (current.get(element) !== watched.story) {
        this.unwatch(watcher, element, watched);
      }
    }

    for (const [element, story] of current) {
      if (watcher.watched.has(element)) continue;
      watcher.watched.set(element, { story, visible: false });
      watcher.observer.observe(element);
    }
  }

  // A hidden page (another tab, minimized) breaks the 2 seconds: they start
  // over when it shows again.
  private readonly onVisibilityChange = () => {
    for (const watched of this.views?.watched.values() ?? []) {
      if (document.hidden) this.stopTimer(watched);
      else if (watched.visible) this.startTimer(watched);
    }
  };

  private startTimer(watched: Watched) {
    if (watched.timer || globalThis.document?.hidden) return;
    watched.timer = setTimeout(() => {
      watched.timer = undefined;
      if (this.views) this.sendWatched(this.views, watched.story);
    }, VIEW_DURATION_MS);
  }

  private stopTimer(watched: Watched) {
    clearTimeout(watched.timer);
    watched.timer = undefined;
  }

  // Once sent, the Story's other elements no longer need watching.
  private sendWatched(watcher: Watcher, story: StoryAd) {
    this.send(watcher.kind, story);
    if (!this.wasSent(watcher.kind, story)) return;

    for (const [element, watched] of watcher.watched) {
      if (watched.story.ad_id === story.ad_id) {
        this.unwatch(watcher, element, watched);
      }
    }
  }

  private unwatch(watcher: Watcher, element: Element, watched: Watched) {
    this.stopTimer(watched);
    watcher.observer.unobserve(element);
    watcher.watched.delete(element);
  }
}

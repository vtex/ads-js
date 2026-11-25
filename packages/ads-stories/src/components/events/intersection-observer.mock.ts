import { vi } from "vitest";

/**
 * IntersectionObserver as the element uses it: tests report how much of an
 * element is on screen with intersect(). jsdom doesn't implement it.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();

  readonly threshold: number | number[] | undefined;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.threshold = options?.threshold;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
  }

  report(target: Element, ratio: number) {
    if (!this.observed.has(target)) return;
    this.callback(
      [
        {
          target,
          intersectionRatio: ratio,
          isIntersecting: ratio > 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

/** Stubs the global with a fresh fake; vi.unstubAllGlobals() removes it. */
export function installIntersectionObserverMock() {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
}

/**
 * The elements watched now, without repeats: by every observer, or only by
 * those created with `threshold`.
 */
export const observed = (threshold?: number) => [
  ...new Set(
    FakeIntersectionObserver.instances
      .filter((o) => threshold === undefined || o.threshold === threshold)
      .flatMap((o) => [...o.observed]),
  ),
];

/** Reports `ratio` of the element on screen to every observer watching it. */
export function intersect(element: Element | null | undefined, ratio: number) {
  if (!element) throw new Error("No element to intersect");
  for (const observer of FakeIntersectionObserver.instances) {
    observer.report(element, ratio);
  }
}

/** Reports every watched element fully on screen. */
export function intersectAll() {
  for (const element of observed()) intersect(element, 1);
}

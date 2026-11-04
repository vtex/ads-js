import {
  render,
  type ReactiveController,
  type ReactiveControllerHost,
} from "lit";

/**
 * A stand-in for a LitElement, to test templates and controllers alone.
 * `create` makes the controller with the host; `view` renders it into a
 * container in the page, now and on every requestUpdate(). The render is
 * synchronous, so a test reads the DOM right after an event; an update
 * requested while rendering runs right after it.
 */
export function mountHost<T>(
  create: (host: ReactiveControllerHost) => T,
  view: (controller: T) => unknown,
) {
  const container = document.createElement("div");
  document.body.append(container);

  const controllers = new Set<ReactiveController>();
  let rendering = false;
  let pending = false;

  function update() {
    if (rendering) {
      pending = true;
      return;
    }
    rendering = true;
    try {
      do {
        pending = false;
        render(view(controller), container);
      } while (pending);
    } finally {
      rendering = false;
    }
  }

  const host: ReactiveControllerHost & {
    /** Calls hostDisconnected() on the controllers, as an element removed. */
    disconnect(): void;
  } = {
    addController: (controller) => controllers.add(controller),
    removeController: (controller) => controllers.delete(controller),
    requestUpdate: update,
    get updateComplete() {
      return Promise.resolve(true);
    },
    disconnect: () => controllers.forEach((c) => c.hostDisconnected?.()),
  };

  const controller = create(host);
  update();
  return { host, container, controller };
}

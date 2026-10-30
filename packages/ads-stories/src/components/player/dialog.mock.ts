// jsdom implements neither <dialog> methods nor popovers. These stand-ins
// record how an element is shown, and throw like browsers do when it is shown
// while already showing, so tests catch a mode switch that skips hiding.
type ShownAs = "popover" | "modal" | "non-modal";

const shown = new WeakMap<Element, ShownAs>();

export function shownAs(element: Element) {
  return shown.get(element) ?? null;
}

function show(element: Element, as: ShownAs) {
  if (shown.has(element)) {
    throw new DOMException("Already showing", "InvalidStateError");
  }
  shown.set(element, as);
}

export function installDialogMocks() {
  const dialog = HTMLDialogElement.prototype;
  const element = HTMLElement.prototype;

  dialog.show ??= function (this: HTMLDialogElement) {
    show(this, "non-modal");
    this.setAttribute("open", "");
  };
  dialog.showModal ??= function (this: HTMLDialogElement) {
    show(this, "modal");
    this.setAttribute("open", "");
  };
  dialog.close ??= function (this: HTMLDialogElement) {
    if (shown.get(this) !== "popover") shown.delete(this);
    this.removeAttribute("open");
  };
  element.showPopover ??= function (this: HTMLElement) {
    show(this, "popover");
  };
  element.hidePopover ??= function (this: HTMLElement) {
    if (shown.get(this) === "popover") shown.delete(this);
  };
}

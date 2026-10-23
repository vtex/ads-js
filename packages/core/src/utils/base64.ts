export const atob = (val: string) => {
  if (typeof globalThis.window !== "undefined" && globalThis.window.atob) {
    return globalThis.window.atob(val);
  }
  return Buffer.from(val, "base64").toString();
};

export const btoa = (val: string) => {
  if (typeof globalThis.window !== "undefined" && globalThis.window.btoa) {
    return globalThis.window.btoa(val);
  }
  return Buffer.from(val).toString("base64");
};

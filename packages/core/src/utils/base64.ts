export const atob = (val: string) => {
  if (window.atob) {
    return window.atob(val);
  }
  return Buffer.from(val, "base64").toString();
};

export const btoa = (val: string) => {
  if (window.btoa) {
    return window.btoa(val);
  }
  return Buffer.from(val).toString("base64");
};

export const atob = (val: string) => {
  if (window.atob) {
    return window.atob(val);
  }
  return new Buffer(val, "base64").toString();
};

export const btoa = (val: string) => {
  if (window.btoa) {
    return window.btoa(val);
  }
  return new Buffer(val).toString("base64");
};

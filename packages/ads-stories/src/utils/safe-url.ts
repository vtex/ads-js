// Only absolute http(s) URLs reach the DOM or the network. Relative and
// protocol-relative ones ("/a.jpg", "//host/a.jpg") don't parse without a
// base, so they're out.
export function httpUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

const STORE_BASE = "https://store.invalid";

// A path on the store the Story runs in ("/product/p"), resolved the way the
// browser would, or null when it lands on another host ("//evil.com",
// "/\\evil.com", "/\t/evil.com").
function storePath(value: string) {
  try {
    const url = new URL(value, STORE_BASE);
    return url.origin === STORE_BASE
      ? `${url.pathname}${url.search}${url.hash}`
      : null;
  } catch {
    return null;
  }
}

// A destination is an absolute http(s) URL or a path on the store the
// Story runs in.
export function destinationUrl(value: string | undefined) {
  if (!value) return null;
  return value.startsWith("/") ? storePath(value) : httpUrl(value);
}

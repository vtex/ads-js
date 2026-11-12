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

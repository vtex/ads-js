export type RuntimeEnv = "dev" | "prod" | "unknown";

/**
 * Detects VTEX IO runtime environment when available on the browser.
 * Returns "dev" when window.__RUNTIME__.production === false,
 * "prod" when === true, and "unknown" when undetectable
 * (including SSR and non-VTEX environments).
 */
export function detectRuntimeEnv(): RuntimeEnv {
  try {
    if (typeof window !== "undefined") {
      const runtime = (
        window as unknown as {
          __RUNTIME__?: { production?: boolean };
        }
      ).__RUNTIME__;

      if (runtime && typeof runtime.production === "boolean") {
        return runtime.production === false ? "dev" : "prod";
      }

      return "unknown";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

export function logByRuntimeEnv(message: string, env: RuntimeEnv): void {
  if (env === "dev" || env === "unknown") {
    console.warn(message);
  }
}

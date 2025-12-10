import { createLogsClient } from "@vtex/ads-core";
import type { LogsClient } from "@vtex/ads-core";

let logsClientPromise: Promise<LogsClient> | null = null;
let logsClientInstance: LogsClient | null = null;

/**
 * Gets or initializes the logs client
 * Uses a fixed endpoint for VTEX observability
 * @param environment - Environment where the app is running.
 *   If "development", logs are disabled.
 */
async function getLogsClient(
  environment: "development" | "production" = "development",
): Promise<LogsClient | null> {
  // Don't send logs in development
  if (environment === "development") {
    return null;
  }

  // If already initialized and ready, return it immediately
  if (logsClientInstance && logsClientInstance.isReady()) {
    return logsClientInstance;
  }

  // If initialization is in progress, wait for it
  if (logsClientPromise) {
    try {
      const client = await logsClientPromise;
      // Update instance if promise resolved successfully
      if (client && client.isReady()) {
        logsClientInstance = client;
      }
      return client;
    } catch {
      // If initialization failed, clear promise and return null
      logsClientPromise = null;
      return null;
    }
  }

  // Use fixed endpoint for logs
  const endpoint = "http://stable.vtexobservability.com/";

  // Initialize the logs client
  logsClientPromise = createLogsClient({
    appName: "@vtex/ads-react",
    componentName: "AdsProvider",
    version: "0.3.1",
    endpoint,
    enabled: true,
  });

  try {
    logsClientInstance = await logsClientPromise;
    return logsClientInstance;
  } catch (error) {
    console.error("Failed to initialize logs client:", error);
    logsClientPromise = null;
    logsClientInstance = null;
    return null;
  }
}

/**
 * Logs an error message using the telemetry client
 * This function is non-blocking and will not throw errors
 * It waits for the client to be initialized if needed
 */
export async function logError(
  message: string,
  attributes?: Record<string, string | number | boolean>,
  environment: "development" | "production" = "development",
): Promise<void> {
  try {
    // Wait for client initialization if needed
    const client = await getLogsClient(environment);
    if (client && client.isReady()) {
      client.error(message, attributes);
    } else if (client) {
      // If client exists but not ready, try to send anyway
      // The underlying client may handle queuing
      client.error(message, attributes);
    }
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error("Failed to send error log:", error);
  }
}

/**
 * Synchronous version that logs without blocking
 * Uses setTimeout to avoid blocking the main thread
 * Ensures the log is sent even if client initialization is in progress
 */
export function logErrorSync(
  message: string,
  attributes?: Record<string, string | number | boolean>,
  environment: "development" | "production" = "development",
): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  // This ensures the log is sent even if client initialization is in progress
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(
      () => {
        logError(message, attributes, environment).catch(() => {
          // Silently fail - errors are already logged in logError
        });
      },
      { timeout: 1000 },
    );
  } else {
    // Fallback to setTimeout with a small delay to allow initialization
    setTimeout(() => {
      logError(message, attributes, environment).catch(() => {
        // Silently fail - errors are already logged in logError
      });
    }, 100);
  }
}

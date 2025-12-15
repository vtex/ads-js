import { createLogsClient } from "@vtex/ads-core";
import type { LogsClient } from "@vtex/ads-core";

let logsClientPromise: Promise<LogsClient> | null = null;
let logsClientInstance: LogsClient | null = null;

const endpoint = "https://stable.vtexobservability.com";

/**
 * Pre-initializes the logs client to ensure it's ready when needed
 * This helps prevent log requests from being cancelled during component unmount
 */
function preInitializeLogsClient(
  environment: "development" | "production" = "development",
): void {
  if (environment === "development") {
    return;
  }

  if (logsClientInstance?.isReady() || logsClientPromise) {
    return;
  }

  logsClientPromise = createLogsClient({
    appName: "@vtex/ads-react",
    componentName: "AdsProvider",
    version: "0.3.1",
    endpoint,
    enabled: true,
  });

  logsClientPromise
    .then((client) => {
      logsClientInstance = client;
    })
    .catch(() => {
      logsClientPromise = null;
    });
}

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
    if (client) {
      // Always try to send, even if not ready
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
 * Starts the log process immediately to ensure it's sent
 * Uses microtask queue to avoid blocking the main thread
 */
export function logErrorSync(
  message: string,
  attributes?: Record<string, string | number | boolean>,
  environment: "development" | "production" = "development",
): void {
  preInitializeLogsClient(environment);
  setTimeout(() => {
    logError(message, attributes, environment).catch(() => {
      // Silently fail - errors are already logged in logError
    });
  }, 0);
}

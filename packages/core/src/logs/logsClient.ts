import {
  NewTelemetryClient,
  Exporters,
  Types,
  Config,
} from "@vtex/diagnostics-web";
import type { LogsClient, LogsClientConfig, LogAttributes } from "./types";

/**
 * Creates a new logs client instance
 * @param config Configuration for the logs client
 * @returns Promise that resolves to a LogsClient instance
 */
export async function createLogsClient(
  config: LogsClientConfig,
): Promise<LogsClient> {
  const {
    appName,
    componentName,
    version,
    endpoint,
    attributes = {},
    enabled = true,
  } = config;

  if (!enabled) {
    return createNoOpLogsClient();
  }

  try {
    // Convert attributes to strings for additionalAttrs
    const stringAttributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      stringAttributes[key] = String(value);
    }

    const telemetryClient = await NewTelemetryClient(
      appName,
      componentName,
      version,
      {
        additionalAttrs: stringAttributes,
      },
    );

    const logsClient = await telemetryClient.newLogsClient({
      exporter: Exporters.CreateExporter(
        {
          telemetryType: Types.TelemetryType.LOGS,
          options: {
            endpoint,
          },
        },
        "otlp",
        Config.ExporterProfile.BACKOFFICE,
      ),
      flushIntervalMs: 1000, // Flush logs every 1 second
    });

    const isInitialized = true;

    // vtex.search_index must be included in each log call
    // to appear in logRecords.attributes
    const defaultLogAttributes: LogAttributes = {
      "vtex.search_index": "ads_sdk",
      ...attributes,
    };

    return {
      info: (message: string, logAttributes?: LogAttributes) => {
        if (!isInitialized) return;
        try {
          const finalAttributes: LogAttributes = {
            ...defaultLogAttributes,
            ...logAttributes,
            "vtex.search_index": "ads_sdk",
          };
          logsClient.info(message, finalAttributes);
        } catch (error) {
          console.error("Failed to send info log:", error);
        }
      },
      warn: (message: string, logAttributes?: LogAttributes) => {
        if (!isInitialized) return;
        try {
          const finalAttributes: LogAttributes = {
            ...defaultLogAttributes,
            ...logAttributes,
            "vtex.search_index": "ads_sdk",
          };
          logsClient.warn(message, finalAttributes);
        } catch (error) {
          console.error("Failed to send warn log:", error);
        }
      },
      error: (message: string, logAttributes?: LogAttributes) => {
        if (!isInitialized) return;
        try {
          // Ensure vtex.search_index is always included
          const finalAttributes: LogAttributes = {
            ...defaultLogAttributes,
            ...logAttributes,
            "vtex.search_index": "ads_sdk", // Always ensure this is present
          };
          logsClient.error(message, finalAttributes);
        } catch (error) {
          console.error("Failed to send error log:", error);
        }
      },
      debug: (message: string, logAttributes?: LogAttributes) => {
        if (!isInitialized) return;
        try {
          const finalAttributes: LogAttributes = {
            ...defaultLogAttributes,
            ...logAttributes,
            "vtex.search_index": "ads_sdk",
          };
          // Note: @vtex/diagnostics-web may not have a debug method
          // Fallback to info if debug is not available
          if (typeof logsClient.debug === "function") {
            logsClient.debug(message, finalAttributes);
          } else {
            logsClient.info(message, finalAttributes);
          }
        } catch (error) {
          console.error("Failed to send debug log:", error);
        }
      },
      isReady: () => isInitialized,
    };
  } catch (error) {
    console.error("Failed to initialize logs client:", error);
    return createNoOpLogsClient();
  }
}

/**
 * Creates a no-op logs client that does nothing
 * Useful when logging is disabled or initialization fails
 */
function createNoOpLogsClient(): LogsClient {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    isReady: () => false,
  };
}

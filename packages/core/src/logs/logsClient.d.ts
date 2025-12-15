import type { LogsClient, LogsClientConfig } from "./types";
/**
 * Creates a new logs client instance
 * @param config Configuration for the logs client
 * @returns Promise that resolves to a LogsClient instance
 */
export declare function createLogsClient(
  config: LogsClientConfig,
): Promise<LogsClient>;

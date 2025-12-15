/**
 * Configuration options for the logs client
 */
export interface LogsClientConfig {
  /**
   * Application name
   */
  appName: string;
  /**
   * Component or module name
   */
  componentName: string;
  /**
   * Application version
   */
  version: string;
  /**
   * OTLP endpoint for logs export
   */
  endpoint: string;
  /**
   * Additional attributes to include in all logs
   */
  attributes?: Record<string, string | number | boolean>;
  /**
   * Whether to enable logs (useful for disabling in production)
   * @default true
   */
  enabled?: boolean;
}

/**
 * Log level types
 */
export type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Attributes that can be attached to a log entry
 */
export interface LogAttributes {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Interface for the logs client
 */
export interface LogsClient {
  /**
   * Log an info message
   */
  info(message: string, attributes?: LogAttributes): void;
  /**
   * Log a warning message
   */
  warn(message: string, attributes?: LogAttributes): void;
  /**
   * Log an error message
   */
  error(message: string, attributes?: LogAttributes): void;
  /**
   * Log a debug message
   */
  debug(message: string, attributes?: LogAttributes): void;
  /**
   * Check if the client is initialized and ready
   */
  isReady(): boolean;
}

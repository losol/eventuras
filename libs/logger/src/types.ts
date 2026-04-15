/**
 * Core type definitions for @eventuras/logger.
 *
 * The `LogTransport` interface is the primary extension point — implement it
 * to send logs to any backend (Pino, Winston, console, a test spy, etc.).
 */

/** Standard log levels ordered by severity (lowest → highest). */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Pluggable transport interface for log output.
 *
 * Implement this to send structured log data to any backend.
 * The library ships with `PinoTransport` (default) and `ConsoleTransport`.
 *
 * @example
 * // Custom transport
 * const myTransport: LogTransport = {
 *   log(level, data, msg) { fetch('/logs', { body: JSON.stringify({ level, ...data, msg }) }); },
 *   child(bindings) { return { ...myTransport, log(l, d, m) { myTransport.log(l, { ...bindings, ...d }, m); } }; },
 * };
 */
export interface LogTransport {
  /** Write a log entry at the given level. */
  log(level: LogLevel, data: Record<string, unknown>, msg?: string): void;

  /** Create a child transport with additional bound fields. */
  child(bindings: Record<string, unknown>): LogTransport;

  /** Flush any buffered log entries. */
  flush?(): Promise<void>;

  /** Graceful shutdown — flush and release resources. */
  shutdown?(): Promise<void>;
}

/** Options for creating a scoped Logger instance. */
export type LoggerOptions = {
  /** If true, only logs in development mode. */
  developerOnly?: boolean;
  /** Namespace for filtering logs (e.g., 'web:admin:events'). */
  namespace?: string;
  /** Minimum log level for this logger instance. */
  level?: LogLevel;
  /** Persistent context fields included in every log entry. */
  context?: Record<string, unknown>;
  /** Correlation ID for request tracing. */
  correlationId?: string;
};

/** Extended options for error/fatal log methods. */
export type ErrorLoggerOptions = LoggerOptions & {
  error?: unknown;
};

/** Global logger configuration. */
export type LoggerConfig = {
  /** Global minimum log level. */
  level?: LogLevel;
  /** Field paths to redact from log output (e.g., ['password', 'token']). */
  redact?: string[];
  /** Optional file path for log output (Pino only). */
  destination?: string;
  /**
   * Custom transport implementation. The default depends on the runtime:
   * `PinoTransport` (JSON output) on Node.js, and `ConsoleTransport`
   * (browser-safe `console.*` calls) in browser/edge runtimes. For
   * pretty-printed dev output, use `configureNodeLogger` from
   * `@eventuras/logger/node`.
   */
  transport?: LogTransport;
};

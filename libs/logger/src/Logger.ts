/**
 * Structured logger with pluggable transports.
 *
 * Uses a `LogTransport` abstraction so the logging backend can be swapped
 * without changing application code. Ships with PinoTransport (default,
 * production-grade) and ConsoleTransport (browser/testing).
 *
 * Standard log levels:
 * fatal: 60 | error: 50 | warn: 40 | info: 30 | debug: 20 | trace: 10
 *
 * @example
 * // Scoped logger (recommended pattern)
 * const logger = Logger.create({
 *   namespace: 'CollectionEditor',
 *   context: { collectionId: 123 },
 * });
 * logger.info('Event added', { eventId: 456 });
 *
 * @example
 * // Static one-off logs
 * Logger.info('Simple message');
 * Logger.error({ error: err }, 'Something failed');
 *
 * @example
 * // Custom transport
 * import { ConsoleTransport } from '@eventuras/logger';
 * Logger.configure({ transport: new ConsoleTransport() });
 */
import type {
  ErrorLoggerOptions,
  LoggerConfig,
  LoggerOptions,
  LogLevel,
  LogTransport,
} from './types';
import { PinoTransport } from './transports/pino';

const DEFAULT_REDACT = ['password', 'token', 'apiKey', 'authorization', 'secret'];

function getEnv(key: string): string | undefined {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as Record<string, unknown>).process === 'object') {
    return (globalThis as unknown as { process: { env: Record<string, string | undefined>; }; }).process.env[key];
  }
  return undefined;
}

function createDefaultTransport(config: LoggerConfig): LogTransport {
  return new PinoTransport({
    level: config.level ?? (getEnv('LOG_LEVEL') as LogLevel | undefined) ?? 'info',
    redact: config.redact ?? DEFAULT_REDACT,
    prettyPrint: config.prettyPrint ?? getEnv('NODE_ENV') === 'development',
    destination: config.destination,
  });
}

export class Logger {
  private static transport: LogTransport;
  private static config: LoggerConfig = {};

  // Instance properties for scoped logger
  private options: LoggerOptions;
  private childTransport?: LogTransport;

  static {
    Logger.transport = createDefaultTransport(Logger.config);
  }

  private constructor(options: LoggerOptions = {}) {
    this.options = options;

    if (options.context || options.correlationId || options.namespace) {
      const bindings: Record<string, unknown> = {
        ...(options.namespace && { namespace: options.namespace }),
        ...(options.correlationId && { correlationId: options.correlationId }),
        ...(options.context || {}),
      };
      this.childTransport = Logger.transport.child(bindings);
    }
  }

  /**
   * Configure global logger settings. Call once at application startup.
   *
   * Supply a custom `transport` to replace the default Pino backend,
   * or omit it to keep PinoTransport with the provided options.
   *
   * @example
   * Logger.configure({ level: 'debug', redact: ['password', 'apiKey'] });
   *
   * @example
   * import { ConsoleTransport } from '@eventuras/logger';
   * Logger.configure({ transport: new ConsoleTransport() });
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
    Logger.transport = Logger.config.transport ?? createDefaultTransport(Logger.config);
    // Re-bind static convenience methods to the new transport
    Logger.rebindStaticMethods();
  }

  /**
   * Get the active transport for advanced integrations.
   *
   * If you need access to the underlying Pino instance (e.g. for OTel
   * instrumentation), check `transport instanceof PinoTransport` and
   * access `.pino` on it.
   */
  static getTransport(): LogTransport {
    return Logger.transport;
  }

  /**
   * @deprecated Use `Logger.getTransport()` instead. If you need the raw
   * Pino instance, cast the transport: `(Logger.getTransport() as PinoTransport).pino`
   */
  static getPinoInstance(): import('pino').Logger {
    if (Logger.transport instanceof PinoTransport) {
      return Logger.transport.pino;
    }
    throw new Error(
      'getPinoInstance() requires PinoTransport. Use Logger.getTransport() for the active transport.',
    );
  }

  // --- Static convenience methods ---

  private static isDevelopment(): boolean {
    return getEnv('NODE_ENV') === 'development';
  }

  private static formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\nStack: ${error.stack}`;
    }
    return String(error);
  }

  private static buildLogData(options: LoggerOptions): Record<string, unknown> {
    return {
      ...(options.namespace && { namespace: options.namespace }),
      ...(options.correlationId && { correlationId: options.correlationId }),
      ...(options.context || {}),
    };
  }

  private static staticLog(
    level: LogLevel,
    options: LoggerOptions,
    ...msg: unknown[]
  ): void {
    if (options.developerOnly && !Logger.isDevelopment()) return;
    const data = Logger.buildLogData(options);
    Logger.transport.log(level, { ...data, msg });
  }

  private static staticErrorLog(
    level: LogLevel,
    options: ErrorLoggerOptions,
    ...msg: unknown[]
  ): void {
    if (options.developerOnly && !Logger.isDevelopment()) return;
    const errorInfo = options.error ? { error: Logger.formatError(options.error) } : {};
    const data = { ...Logger.buildLogData(options), ...errorInfo };
    Logger.transport.log(level, { ...data, msg });
  }

  static info(options: LoggerOptions, ...msg: unknown[]): void {
    Logger.staticLog('info', options, ...msg);
  }
  static debug(options: LoggerOptions, ...msg: unknown[]): void {
    Logger.staticLog('debug', options, ...msg);
  }
  static trace(options: LoggerOptions, ...msg: unknown[]): void {
    Logger.staticLog('trace', options, ...msg);
  }
  static warn(options: LoggerOptions, ...msg: unknown[]): void {
    Logger.staticLog('warn', options, ...msg);
  }
  static error(options: ErrorLoggerOptions, ...msg: unknown[]): void {
    Logger.staticErrorLog('error', options, ...msg);
  }
  static fatal(options: ErrorLoggerOptions, ...msg: unknown[]): void {
    Logger.staticErrorLog('fatal', options, ...msg);
  }

  private static rebindStaticMethods(): void {
    // No-op — static methods now delegate through Logger.transport directly
    // so rebinding is not needed. Kept for API compatibility.
  }

  /**
   * Create a scoped logger instance with predefined options.
   *
   * @example
   * const logger = Logger.create({ namespace: 'CollectionEditor' });
   * logger.info('Something happened');
   *
   * @example
   * const logger = Logger.create({
   *   namespace: 'API',
   *   context: { userId: 123 },
   *   correlationId: req.headers['x-correlation-id'],
   * });
   * logger.info({ eventId: 789 }, 'Event added');
   */
  static create(options: LoggerOptions = {}): Logger {
    return new Logger(options);
  }

  // --- Instance methods ---

  private logInstance(level: LogLevel, data?: Record<string, unknown> | string, msg?: string): void {
    const transport = this.childTransport ?? Logger.transport;
    if (typeof data === 'string') {
      transport.log(level, {}, data);
    } else if (msg) {
      transport.log(level, data ?? {}, msg);
    } else {
      transport.log(level, data ?? {});
    }
  }

  /** Log at `trace` level. Pass a string or `{ data }` with an optional message. */
  trace(data?: Record<string, unknown> | string, msg?: string): void {
    this.logInstance('trace', data, msg);
  }

  /** Log at `debug` level. */
  debug(data?: Record<string, unknown> | string, msg?: string): void {
    this.logInstance('debug', data, msg);
  }

  /** Log at `info` level. */
  info(data?: Record<string, unknown> | string, msg?: string): void {
    this.logInstance('info', data, msg);
  }

  /** Log at `warn` level. */
  warn(data?: Record<string, unknown> | string, msg?: string): void {
    this.logInstance('warn', data, msg);
  }

  /**
   * Log at `error` level. Accepts an `Error` instance, a data object, or a plain string.
   * Error instances are serialized automatically.
   */
  error(errorOrData?: unknown, msg?: string): void {
    const transport = this.childTransport ?? Logger.transport;
    if (typeof errorOrData === 'string') {
      transport.log('error', {}, errorOrData);
    } else if (errorOrData instanceof Error) {
      transport.log('error', { error: errorOrData }, msg);
    } else if (msg) {
      transport.log('error', (errorOrData as Record<string, unknown>) ?? {}, msg);
    } else {
      transport.log('error', (errorOrData as Record<string, unknown>) ?? {});
    }
  }

  /**
   * Log at `fatal` level. Same signature as `error()` but signals a critical/shutdown failure.
   */
  fatal(errorOrData?: unknown, msg?: string): void {
    const transport = this.childTransport ?? Logger.transport;
    if (typeof errorOrData === 'string') {
      transport.log('fatal', {}, errorOrData);
    } else if (errorOrData instanceof Error) {
      transport.log('fatal', { error: errorOrData }, msg);
    } else if (msg) {
      transport.log('fatal', (errorOrData as Record<string, unknown>) ?? {}, msg);
    } else {
      transport.log('fatal', (errorOrData as Record<string, unknown>) ?? {});
    }
  }
}

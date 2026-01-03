/**
 * Production logger using Pino.
 *
 * This logger is optimized for production use with structured logging, context fields,
 * correlation IDs, auto-redaction, and configurable log levels.
 *
 * For external integrations (e.g., Sentry), use the @eventuras/logger-sentry package.
 * For development debugging, use the Debug utility instead.
 *
 * Standard log levels (Pino):
 * fatal: 60
 * error: 50
 * warn: 40
 * info: 30
 * debug: 20
 * trace: 10
 *
 * @example
 * // Static usage for one-off logs
 * Logger.info('Simple message');
 * Logger.error({ error: err }, 'Something failed');
 *
 * @example
 * // Scoped logger with context
 * const logger = Logger.create({
 *   namespace: 'CollectionEditor',
 *   context: { collectionId: 123 }
 * });
 * logger.info('Event added', { eventId: 456 });
 * // Logs: { namespace: 'CollectionEditor', collectionId: 123, eventId: 456, msg: 'Event added' }
 */
import pino, { type Logger as PinoLogger } from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LoggerOptions = {
  /** If true, only logs in development mode */
  developerOnly?: boolean;
  /** Namespace for filtering logs (e.g., 'CollectionEditor') */
  namespace?: string;
  /** Minimum log level for this logger instance */
  level?: LogLevel;
  /** Persistent context fields to include in all logs */
  context?: Record<string, unknown>;
  /** Correlation ID for request tracking */
  correlationId?: string;
};

export type ErrorLoggerOptions = LoggerOptions & {
  error?: unknown;
};

export type LoggerConfig = {
  /** Global minimum log level */
  level?: LogLevel;
  /** Paths to redact from logs (e.g., ['password', 'token']) */
  redact?: string[];
  /** Optional file path for log output */
  destination?: string;
};

export class Logger {
  private static pinoLogger: PinoLogger;
  private static config: LoggerConfig = {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    redact: ['password', 'token', 'apiKey', 'authorization', 'secret'],
  };

  // Instance properties for scoped logger
  private options: LoggerOptions;
  private childLogger?: PinoLogger;

  static {
    // Initialize Pino logger with configuration
    Logger.pinoLogger = Logger.createPinoInstance();
  }

  private constructor(options: LoggerOptions = {}) {
    this.options = options;

    // Create child logger with context if provided
    if (options.context || options.correlationId || options.namespace) {
      const bindings: Record<string, unknown> = {
        ...(options.namespace && { namespace: options.namespace }),
        ...(options.correlationId && { correlationId: options.correlationId }),
        ...(options.context || {}),
      };
      this.childLogger = Logger.pinoLogger.child(bindings);

      // Set level if specified
      if (options.level) {
        this.childLogger.level = options.level;
      }
    }
  }

  private static createPinoInstance(): PinoLogger {
    const options: pino.LoggerOptions = {
      level: Logger.config.level || 'info',
      redact: {
        paths: Logger.config.redact || [],
        censor: '[REDACTED]',
      },
    };

    // File destination if specified
    if (Logger.config.destination) {
      return pino(options, pino.destination(Logger.config.destination));
    }

    // Use standard JSON logging - works well with all log aggregation services
    return pino(options);
  }

  /**
   * Configure global logger settings. Call this once at application startup.
   *
   * @example
   * Logger.configure({
   *   level: 'debug',
   *   redact: ['password', 'apiKey'],
   * });
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
    Logger.pinoLogger = Logger.createPinoInstance();
  }

  /**
   * Get the internal Pino instance for advanced use cases or external integrations.
   * For example, @eventuras/logger-sentry uses this to connect Sentry transport.
   *
   * @example
   * import { initializeSentryLogger } from '@eventuras/logger-sentry';
   * initializeSentryLogger(); // Uses Logger.getPinoInstance() internally
   */
  static getPinoInstance(): PinoLogger {
    return Logger.pinoLogger;
  }

  private static formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\nStack: ${error.stack}`;
    }
    return String(error);
  }

  private static wrapLogger(pinoFunction: (obj: any, msg?: string | undefined) => void) {
    return (
      options: LoggerOptions = { developerOnly: false, namespace: '' },
      ...msg: any | any[]
    ) => {
      if (options.developerOnly && process.env.NODE_ENV !== 'development') {
        return;
      }

      const logData: Record<string, unknown> = {
        ...(options.namespace && { namespace: options.namespace }),
        ...(options.correlationId && { correlationId: options.correlationId }),
        ...(options.context || {}),
      };

      pinoFunction({ ...logData, msg: msg });
    };
  }

  private static wrapErrorLogger(pinoFunction: (obj: any, msg?: string | undefined) => void) {
    return (
      options: ErrorLoggerOptions = { developerOnly: false, namespace: '' },
      ...msg: any | any[]
    ) => {
      if (options.developerOnly && process.env.NODE_ENV !== 'development') {
        return;
      }

      const errorInfo = options.error ? { error: Logger.formatError(options.error) } : {};

      const logData: Record<string, unknown> = {
        ...(options.namespace && { namespace: options.namespace }),
        ...(options.correlationId && { correlationId: options.correlationId }),
        ...(options.context || {}),
        ...errorInfo,
      };

      pinoFunction({ ...logData, msg: msg });
    };
  }

  static info = Logger.wrapLogger(
    Logger.pinoLogger.info.bind(Logger.pinoLogger),
  ).bind(Logger);

  static debug = Logger.wrapLogger(
    Logger.pinoLogger.debug.bind(Logger.pinoLogger),
  ).bind(Logger);

  static trace = Logger.wrapLogger(
    Logger.pinoLogger.trace.bind(Logger.pinoLogger),
  ).bind(Logger);

  static warn = Logger.wrapLogger(
    Logger.pinoLogger.warn.bind(Logger.pinoLogger),
  ).bind(Logger);

  static error = Logger.wrapErrorLogger(
    Logger.pinoLogger.error.bind(Logger.pinoLogger),
  ).bind(Logger);

  static fatal = Logger.wrapErrorLogger(
    Logger.pinoLogger.fatal.bind(Logger.pinoLogger),
  ).bind(Logger);

  /**
   * Create a scoped logger instance with predefined options.
   * Use this when you have multiple log calls in the same component/module.
   *
   * @example
   * // Basic scoped logger
   * const logger = Logger.create({ namespace: 'CollectionEditor' });
   * logger.info('Something happened');
   *
   * @example
   * // With context fields
   * const logger = Logger.create({
   *   namespace: 'API',
   *   context: { userId: 123, collectionId: 456 },
   *   correlationId: req.headers['x-correlation-id']
   * });
   * logger.info('Event added', { eventId: 789 });
   * // Logs: { namespace: 'API', userId: 123, collectionId: 456, correlationId: 'abc', eventId: 789, msg: 'Event added' }
   *
   * @example
   * // With custom log level
   * const logger = Logger.create({
   *   namespace: 'Eventuras:ConvertoApi',
   *   level: 'debug'
   * });
   */
  static create(options: LoggerOptions = {}): Logger {
    return new Logger(options);
  }

  // Instance methods that merge instance options with call-time options

  /**
   * Log at trace level (most verbose)
   */
  trace(data?: Record<string, unknown> | string, msg?: string): void {
    if (this.childLogger) {
      if (typeof data === 'string') {
        this.childLogger.trace(data);
      } else if (msg) {
        this.childLogger.trace(data, msg);
      } else {
        this.childLogger.trace(data);
      }
    } else {
      Logger.trace(this.options, data, msg);
    }
  }

  /**
   * Log at debug level
   */
  debug(data?: Record<string, unknown> | string, msg?: string): void {
    if (this.childLogger) {
      if (typeof data === 'string') {
        this.childLogger.debug(data);
      } else if (msg) {
        this.childLogger.debug(data, msg);
      } else {
        this.childLogger.debug(data);
      }
    } else {
      Logger.debug(this.options, data, msg);
    }
  }

  /**
   * Log at info level
   */
  info(data?: Record<string, unknown> | string, msg?: string): void {
    if (this.childLogger) {
      if (typeof data === 'string') {
        this.childLogger.info(data);
      } else if (msg) {
        this.childLogger.info(data, msg);
      } else {
        this.childLogger.info(data);
      }
    } else {
      Logger.info(this.options, data, msg);
    }
  }

  /**
   * Log at warn level
   */
  warn(data?: Record<string, unknown> | string, msg?: string): void {
    if (this.childLogger) {
      if (typeof data === 'string') {
        this.childLogger.warn(data);
      } else if (msg) {
        this.childLogger.warn(data, msg);
      } else {
        this.childLogger.warn(data);
      }
    } else {
      Logger.warn(this.options, data, msg);
    }
  }

  /**
   * Log at error level
   */
  error(errorOrData?: unknown, msg?: string): void {
    if (this.childLogger) {
      // Support: logger.error('message') and logger.error({ error }, 'message')
      if (typeof errorOrData === 'string') {
        this.childLogger.error(errorOrData);
      } else if (errorOrData instanceof Error) {
        if (msg) {
          this.childLogger.error({ error: errorOrData }, msg);
        } else {
          this.childLogger.error({ error: errorOrData });
        }
      } else if (msg) {
        this.childLogger.error(errorOrData, msg);
      } else {
        this.childLogger.error(errorOrData);
      }
    } else {
      // Fallback to static method
      if (typeof errorOrData === 'object' && errorOrData !== null && 'error' in errorOrData) {
        Logger.error({ ...this.options, ...(errorOrData as ErrorLoggerOptions) }, msg);
      } else {
        Logger.error(this.options, errorOrData, msg);
      }
    }
  }

  /**
   * Log at fatal level (highest severity)
   */
  fatal(errorOrData?: unknown, msg?: string): void {
    if (this.childLogger) {
      // Support: logger.fatal('message') and logger.fatal({ error }, 'message')
      if (typeof errorOrData === 'string') {
        this.childLogger.fatal(errorOrData);
      } else if (errorOrData instanceof Error) {
        if (msg) {
          this.childLogger.fatal({ error: errorOrData }, msg);
        } else {
          this.childLogger.fatal({ error: errorOrData });
        }
      } else if (msg) {
        this.childLogger.fatal(errorOrData, msg);
      } else {
        this.childLogger.fatal(errorOrData);
      }
    } else {
      // Fallback to static method
      if (typeof errorOrData === 'object' && errorOrData !== null && 'error' in errorOrData) {
        Logger.fatal({ ...this.options, ...(errorOrData as ErrorLoggerOptions) }, msg);
      } else {
        Logger.fatal(this.options, errorOrData, msg);
      }
    }
  }
}

/**
 * Pluggable logger for fides-auth.
 *
 * By default, uses a console-based logger. Users can provide their own
 * implementation (pino, winston, etc.) via `configureLogger()`.
 *
 * @example
 * // Use default console logger (no setup needed)
 * import { createLogger } from '@eventuras/fides-auth/logger';
 * const logger = createLogger({ namespace: 'my-app:auth' });
 * logger.info('Authentication successful');
 *
 * @example
 * // Plug in pino
 * import pino from 'pino';
 * import { configureLogger } from '@eventuras/fides-auth/logger';
 *
 * const pinoInstance = pino();
 * configureLogger({
 *   create({ namespace, context }) {
 *     return pinoInstance.child({ namespace, ...context });
 *   },
 * });
 *
 * @example
 * // Plug in @eventuras/logger
 * import { Logger } from '@eventuras/logger';
 * import { configureLogger } from '@eventuras/fides-auth/logger';
 *
 * configureLogger({
 *   create(options) {
 *     return Logger.create(options);
 *   },
 * });
 */

/**
 * Logger interface compatible with pino, winston, and console.
 *
 * All methods accept either:
 * - A string message: `logger.info('hello')`
 * - A context object and message: `logger.info({ userId: 123 }, 'User logged in')`
 */
export interface FidesLogger {
  debug(data?: Record<string, unknown> | string, msg?: string): void;
  info(data?: Record<string, unknown> | string, msg?: string): void;
  warn(data?: Record<string, unknown> | string, msg?: string): void;
  error(data?: Record<string, unknown> | string, msg?: string): void;
}

/** Options for creating a logger instance. */
export interface FidesLoggerOptions {
  /** Namespace for log filtering (e.g., 'fides-auth:oauth') */
  namespace: string;
  /** Persistent context fields included in every log entry */
  context?: Record<string, unknown>;
}

/** Factory that creates logger instances. Implement this to integrate your preferred logger. */
export interface FidesLoggerFactory {
  create(options: FidesLoggerOptions): FidesLogger;
}

/**
 * Console-based logger implementation.
 * Used as the default when no custom logger factory is configured.
 */
class ConsoleLogger implements FidesLogger {
  private prefix: string;

  constructor(namespace: string, context?: Record<string, unknown>) {
    const contextStr = context && Object.keys(context).length > 0
      ? ` ${JSON.stringify(context)}`
      : '';
    this.prefix = `[${namespace}]${contextStr}`;
  }

  debug(data?: Record<string, unknown> | string, msg?: string): void {
    if (typeof data === 'string') {
      console.debug(this.prefix, data);
    } else if (msg) {
      console.debug(this.prefix, msg, data);
    } else if (data) {
      console.debug(this.prefix, data);
    }
  }

  info(data?: Record<string, unknown> | string, msg?: string): void {
    if (typeof data === 'string') {
      console.info(this.prefix, data);
    } else if (msg) {
      console.info(this.prefix, msg, data);
    } else if (data) {
      console.info(this.prefix, data);
    }
  }

  warn(data?: Record<string, unknown> | string, msg?: string): void {
    if (typeof data === 'string') {
      console.warn(this.prefix, data);
    } else if (msg) {
      console.warn(this.prefix, msg, data);
    } else if (data) {
      console.warn(this.prefix, data);
    }
  }

  error(data?: Record<string, unknown> | string, msg?: string): void {
    if (typeof data === 'string') {
      console.error(this.prefix, data);
    } else if (msg) {
      console.error(this.prefix, msg, data);
    } else if (data) {
      console.error(this.prefix, data);
    }
  }
}

const defaultFactory: FidesLoggerFactory = {
  create({ namespace, context }) {
    return new ConsoleLogger(namespace, context);
  },
};

let currentFactory: FidesLoggerFactory = defaultFactory;
let factoryVersion = 0;

/**
 * Configure a custom logger factory for fides-auth.
 *
 * Can be called at any time — even after modules have already created loggers.
 * Existing loggers will pick up the new factory on their next log call.
 *
 * If not called, fides-auth uses a console-based logger.
 *
 * @param factory - A factory that creates logger instances
 */
export function configureLogger(factory: FidesLoggerFactory): void {
  currentFactory = factory;
  factoryVersion++;
}

/**
 * Create a logger instance using the configured factory.
 *
 * Returns a lazy proxy: the underlying logger is created (or re-created)
 * on first use and whenever the factory is changed via `configureLogger()`.
 * This means module-scope loggers work correctly even when `configureLogger()`
 * is called after module imports.
 *
 * @param options - Logger options including namespace and optional context
 * @returns A logger instance
 */
export function createLogger(options: FidesLoggerOptions): FidesLogger {
  let cached: FidesLogger | null = null;
  let cachedVersion = -1;

  function resolve(): FidesLogger {
    if (cached === null || cachedVersion !== factoryVersion) {
      cached = currentFactory.create(options);
      cachedVersion = factoryVersion;
    }
    return cached;
  }

  return {
    debug(data?, msg?) { resolve().debug(data, msg); },
    info(data?, msg?) { resolve().info(data, msg); },
    warn(data?, msg?) { resolve().warn(data, msg); },
    error(data?, msg?) { resolve().error(data, msg); },
  };
}

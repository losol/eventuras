/**
 * Pluggable logger for fides-auth.
 *
 * The default writes newline-delimited JSON to `console.<level>` so output
 * is interoperable with Loki / Grafana / Datadog out of the box, even when
 * the consumer hasn't wired in a structured logger. Users can plug their
 * own backend (pino, winston, @eventuras/logger, ...) via `configureLogger()`.
 *
 * @example
 * // Use default JSONL console logger (no setup needed)
 * import { createLogger } from '@eventuras/fides-auth/logger';
 * const logger = createLogger({ namespace: 'my-app:auth' });
 * logger.info('Authentication successful');
 * // → {"level":"info","time":"…","namespace":"my-app:auth","msg":"Authentication successful"}
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
 * Console-based logger implementation that emits newline-delimited JSON.
 *
 * Used as the default when no custom logger factory is configured. JSONL
 * keeps fides-auth's output interoperable with log shippers (Loki, Grafana,
 * Datadog, etc.) even when the consuming app hasn't wired in a structured
 * logger via `configureLogger()`. Each entry preserves the original
 * `console.<level>` call so browser devtools and CI log filters still work.
 *
 * Output shape (example):
 *
 *   {"level":"info","time":"2026-04-15T19:40:57.300Z","namespace":"fides-auth:oauth","msg":"PKCE parameters generated","codeChallenge":"…"}
 *
 * Errors in the `data` field are serialized to `{ name, message, stack }`
 * so they survive `JSON.stringify`.
 */
type ConsoleMethod = 'debug' | 'info' | 'warn' | 'error';

function serializeError(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

/** Field names the logger reserves so callers can't accidentally clobber them. */
const RESERVED_KEYS = new Set(['level', 'time', 'namespace']);

function safeStringify(record: Record<string, unknown>): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(record, (_key, value) => {
      if (value instanceof Error) return serializeError(value);
      if (typeof value === 'bigint') return value.toString();
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    });
  } catch {
    // Last-resort fallback: drop the original record entirely so a single
    // non-serializable payload can't take down the caller's request path.
    return JSON.stringify({
      level: record.level,
      time: record.time,
      namespace: record.namespace,
      msg: typeof record.msg === 'string' ? record.msg : '[unserializable log entry]',
      _serializeError: true,
    });
  }
}

class ConsoleLogger implements FidesLogger {
  constructor(
    private readonly namespace: string,
    private readonly context?: Record<string, unknown>,
  ) { }

  private write(
    method: ConsoleMethod,
    level: 'debug' | 'info' | 'warn' | 'error',
    data?: Record<string, unknown> | string,
    msg?: string,
  ): void {
    // Skip noisy empty entries — match the pre-JSON ConsoleLogger, which
    // dropped calls with no data and no message.
    if (data === undefined && msg === undefined) return;

    // Reserved keys are set first so they appear at the front of the JSON
    // output. User-supplied fields are filtered against RESERVED_KEYS so
    // they can't clobber level/time/namespace.
    const entry: Record<string, unknown> = {
      level,
      time: new Date().toISOString(),
      namespace: this.namespace,
    };

    if (this.context) {
      for (const [key, value] of Object.entries(this.context)) {
        if (!RESERVED_KEYS.has(key)) entry[key] = value;
      }
    }

    if (typeof data === 'string') {
      entry.msg = data;
    } else {
      if (msg !== undefined) entry.msg = msg;
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          if (!RESERVED_KEYS.has(key)) entry[key] = value;
        }
      }
    }

    if (entry.error !== undefined) {
      entry.error = serializeError(entry.error);
    }

    console[method](safeStringify(entry));
  }

  debug(data?: Record<string, unknown> | string, msg?: string): void {
    this.write('debug', 'debug', data, msg);
  }

  info(data?: Record<string, unknown> | string, msg?: string): void {
    this.write('info', 'info', data, msg);
  }

  warn(data?: Record<string, unknown> | string, msg?: string): void {
    this.write('warn', 'warn', data, msg);
  }

  error(data?: Record<string, unknown> | string, msg?: string): void {
    this.write('error', 'error', data, msg);
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

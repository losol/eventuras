/**
 * Pino-based transport — the default production backend.
 *
 * Wraps a Pino logger instance to satisfy the `LogTransport` interface,
 * keeping Pino as an implementation detail that consumers never interact with directly.
 *
 * For pretty-printed dev output, see `configureNodeLogger` in
 * `@eventuras/logger/node` — this module intentionally stays free of
 * `node:stream` imports so the main entry stays browser/edge-safe.
 */
import pino, { type Logger as PinoLogger, type LoggerOptions as PinoLoggerOptions } from 'pino';
import type { LogLevel, LogTransport } from '../types';

/**
 * Minimal structural type for a Pino destination stream — accepts anything
 * with a `write` method. Defined locally so this file (re-exported from the
 * universal `@eventuras/logger` entry) doesn't pull `NodeJS.*` types into
 * browser/edge consumers that don't ship `@types/node`.
 */
export interface PinoDestinationStream {
  write(chunk: string | Uint8Array): unknown;
}

/** Options for creating a PinoTransport. */
export type PinoTransportOptions = {
  /** Minimum log level. Defaults to `'info'`. */
  level?: LogLevel;
  /** Field paths to redact from output. */
  redact?: string[];
  /** File path destination (omit for stdout). */
  destination?: string;
  /**
   * Writable stream destination (e.g. a pretty-print stream from
   * `@eventuras/logger/node`). Takes precedence over `destination`.
   */
  destinationStream?: PinoDestinationStream;
  /** Raw Pino options for advanced tuning (merged after built-in defaults). */
  pinoOptions?: PinoLoggerOptions;
};

export class PinoTransport implements LogTransport {
  /** The underlying Pino instance. Exposed for advanced integrations only. */
  readonly pino: PinoLogger;

  constructor(options: PinoTransportOptions = {}) {
    const pinoOpts: PinoLoggerOptions = {
      level: options.level ?? 'info',
      // ISO timestamps for Loki/Grafana compatibility
      timestamp: pino.stdTimeFunctions.isoTime,
      // Output level as string label — avoids numeric mapping in log pipelines
      formatters: {
        level: (label) => ({ level: label }),
      },
      ...(options.redact && {
        redact: { paths: options.redact, censor: '[REDACTED]' },
      }),
      ...options.pinoOptions,
    };

    if (options.destinationStream) {
      // Pino's overload expects a NodeJS.WritableStream; the structural
      // PinoDestinationStream is a strict subset (only `.write` is read at
      // runtime), so the cast is safe.
      this.pino = pino(pinoOpts, options.destinationStream as Parameters<typeof pino>[1]);
    } else if (options.destination) {
      this.pino = pino(pinoOpts, pino.destination(options.destination));
    } else {
      this.pino = pino(pinoOpts);
    }
  }

  log(level: LogLevel, data: Record<string, unknown>, msg?: string): void {
    if (msg) {
      this.pino[level](data, msg);
    } else {
      this.pino[level](data);
    }
  }

  child(bindings: Record<string, unknown>): LogTransport {
    const childPino = this.pino.child(bindings);
    return new PinoChildTransport(childPino);
  }

  async flush(): Promise<void> {
    this.pino.flush();
  }
}

/**
 * Lightweight wrapper for a Pino child logger.
 * Created by `PinoTransport.child()` — not intended for direct use.
 */
class PinoChildTransport implements LogTransport {
  constructor(private readonly pinoChild: PinoLogger) { }

  log(level: LogLevel, data: Record<string, unknown>, msg?: string): void {
    if (msg) {
      this.pinoChild[level](data, msg);
    } else {
      this.pinoChild[level](data);
    }
  }

  child(bindings: Record<string, unknown>): LogTransport {
    return new PinoChildTransport(this.pinoChild.child(bindings));
  }

  async flush(): Promise<void> {
    this.pinoChild.flush();
  }
}

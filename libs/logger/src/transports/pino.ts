/**
 * Pino-based transport — the default production backend.
 *
 * Wraps a Pino logger instance to satisfy the `LogTransport` interface,
 * keeping Pino as an implementation detail that consumers never interact with directly.
 */
import pino, { type Logger as PinoLogger, type LoggerOptions as PinoLoggerOptions } from 'pino';
import type { LogLevel, LogTransport } from '../types';

/** Options for creating a PinoTransport. */
export type PinoTransportOptions = {
  /** Minimum log level. Defaults to `'info'`. */
  level?: LogLevel;
  /** Field paths to redact from output. */
  redact?: string[];
  /** Enable pretty-printed, human-readable output. */
  prettyPrint?: boolean;
  /** File path destination (omit for stdout). */
  destination?: string;
  /** Raw Pino options for advanced tuning (merged after built-in defaults). */
  pinoOptions?: PinoLoggerOptions;
};

export class PinoTransport implements LogTransport {
  /** The underlying Pino instance. Exposed for advanced integrations only. */
  readonly pino: PinoLogger;

  constructor(options: PinoTransportOptions = {}) {
    const pinoOpts: PinoLoggerOptions = {
      level: options.level ?? 'info',
      ...(options.redact && {
        redact: { paths: options.redact, censor: '[REDACTED]' },
      }),
      ...(options.prettyPrint && {
        transport: { target: 'pino-pretty', options: { colorize: true } },
      }),
      ...options.pinoOptions,
    };

    this.pino = options.destination
      ? pino(pinoOpts, pino.destination(options.destination))
      : pino(pinoOpts);
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

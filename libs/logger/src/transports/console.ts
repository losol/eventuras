/**
 * Console-based transport for browser environments and testing.
 *
 * Uses `console.log/warn/error` — no dependencies, works everywhere.
 * Useful as a lightweight fallback when Pino is not available or desired.
 */
import type { LogLevel, LogTransport } from '../types';

const LEVEL_TO_CONSOLE: Record<LogLevel, 'log' | 'warn' | 'error' | 'debug'> = {
  trace: 'debug',
  debug: 'debug',
  info: 'log',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
};

export class ConsoleTransport implements LogTransport {
  private bindings: Record<string, unknown>;

  constructor(bindings?: Record<string, unknown>) {
    this.bindings = bindings ?? {};
  }

  log(level: LogLevel, data: Record<string, unknown>, msg?: string): void {
    const method = LEVEL_TO_CONSOLE[level];
    const merged = { ...this.bindings, ...data };
    const hasData = Object.keys(merged).length > 0;

    if (msg && hasData) {
      console[method](`[${level}]`, msg, merged);
    } else if (msg) {
      console[method](`[${level}]`, msg);
    } else if (hasData) {
      console[method](`[${level}]`, merged);
    }
  }

  child(bindings: Record<string, unknown>): LogTransport {
    return new ConsoleTransport({ ...this.bindings, ...bindings });
  }
}

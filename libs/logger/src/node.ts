/**
 * Node.js-only exports for @eventuras/logger.
 *
 * These utilities depend on `node:stream` and must not be imported in browser
 * or edge runtime environments. Import from the root entry point
 * (`@eventuras/logger`) for the browser-safe API.
 *
 * @example
 * // Pretty dev output
 * import { configureNodeLogger } from '@eventuras/logger/node';
 * configureNodeLogger({ prettyPrint: process.env.NODE_ENV === 'development' });
 *
 * @example
 * // Lower-level: just the pretty helpers
 * import { createPrettyStream, formatLogLine } from '@eventuras/logger/node';
 */
import { Logger } from './Logger';
import { PinoTransport, type PinoTransportOptions } from './transports/pino';
import { createPrettyStream } from './transports/pretty';
import type { LoggerConfig } from './types';

export { formatLogLine, createPrettyStream } from './transports/pretty';

/** Options for `configureNodeLogger`. */
export type NodeLoggerOptions = Omit<LoggerConfig, 'transport'> & {
  /** Enable human-readable, ANSI-colored output. Off by default. */
  prettyPrint?: boolean;
  /** Raw PinoTransport options for advanced tuning. */
  pinoOptions?: PinoTransportOptions['pinoOptions'];
};

/**
 * Configure the global Logger with a Node-side PinoTransport, optionally
 * wired to a pretty-print stream for development. Keeps the browser/edge
 * main entry free of `node:stream` imports — call this from a Node-only
 * bootstrap (e.g. `instrumentation.ts`, `server.ts`).
 *
 * @example
 * // In your server entry point
 * import { configureNodeLogger } from '@eventuras/logger/node';
 * configureNodeLogger({
 *   level: 'debug',
 *   prettyPrint: process.env.NODE_ENV === 'development',
 * });
 */
export function configureNodeLogger(options: NodeLoggerOptions = {}): void {
  const { prettyPrint, pinoOptions, ...rest } = options;
  Logger.configure({
    ...rest,
    transport: new PinoTransport({
      level: rest.level,
      redact: rest.redact,
      destination: rest.destination,
      destinationStream: prettyPrint ? createPrettyStream() : undefined,
      pinoOptions,
    }),
  });
}

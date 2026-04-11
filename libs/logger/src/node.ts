/**
 * Node.js-only exports for @eventuras/logger.
 *
 * These utilities depend on `node:stream` and must not be imported in browser
 * or edge runtime environments. Import from the root entry point
 * (`@eventuras/logger`) for the browser-safe API.
 *
 * @example
 * import { createPrettyStream, formatLogLine } from '@eventuras/logger/node';
 */
export { formatLogLine, createPrettyStream } from './transports/pretty';

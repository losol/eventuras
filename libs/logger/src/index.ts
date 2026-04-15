// Core Logger
export { Logger } from './Logger';

// Types — re-export from canonical source
export type { LoggerOptions, ErrorLoggerOptions, LoggerConfig, LogLevel, LogTransport } from './types';

// Transports
export { PinoTransport, type PinoTransportOptions } from './transports/pino';
export { ConsoleTransport } from './transports/console';

// HTTP logging utility — header redaction
export { redactHeaders } from './httpLogger';

// Node-only exports (configureNodeLogger, formatLogLine, createPrettyStream)
// are available via '@eventuras/logger/node' to avoid pulling node:stream
// into browser bundles.


/**
 * Simple logger for conductor
 * Namespace-based console logger
 */

export interface Logger {
  info(message: string | object, ...args: unknown[]): void;
  error(message: string | object, ...args: unknown[]): void;
  warn(message: string | object, ...args: unknown[]): void;
  debug(message: string | object, ...args: unknown[]): void;
}

export function createLogger(namespace: string): Logger {
  const formatMessage = (level: string, message: string | object): string => {
    const timestamp = new Date().toISOString();
    const msgStr = typeof message === 'object' ? JSON.stringify(message) : message;
    return `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${msgStr}`;
  };

  return {
    info(message: string | object, ...args: unknown[]) {
      console.log(formatMessage('info', message), ...args);
    },
    error(message: string | object, ...args: unknown[]) {
      console.error(formatMessage('error', message), ...args);
    },
    warn(message: string | object, ...args: unknown[]) {
      console.warn(formatMessage('warn', message), ...args);
    },
    debug(message: string | object, ...args: unknown[]) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(formatMessage('debug', message), ...args);
      }
    },
  };
}

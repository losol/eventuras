/**
 * Wrapper class for debug-js. Meant to ease logging, and future-proof possible usage of different logging frameworks.
 * Uses namespaces to enable or disable logging. See https://www.npmjs.com/package/debug for more information.
 *
 * It now includes Pino as its default logger, with debug to support dev loggin, for namespace filtering only debug
 * is used, but the namespace is forwarded to pino as a helpful reference
 *
 * In short use the env var DEBUG to log all eventuras like so:
 * DEBUG=eventuras:*
 * or only authentication logs for instance
 * DEBUG=eventuras:auth*
 *
 * In the browser a localstorage var has to be set in the console: localStorage.debug = 'eventuras:*'
 *
 * Any unused levels such as debug, warn, etc are there just to more easily support future swapping out,
 * e.g. for Pino or Winston. For developer use info should be used - and can then later be filtered out with
 * the env variable DEBUG on specific namespaces.
 * Standard 'npm' levels are:
 * error: 0,
 * warn: 1,
 * info: 2,
 * http: 3,
 * verbose: 4,
 * debug: 5,
 * silly: 6
 */
import createDebug from 'debug';
import pino from 'pino';

interface DebugCache {
  [key: string]: createDebug.Debugger;
}
export type LoggerOptions = {
  developerOnly?: boolean;
  namespace?: string;
};

class Logger {
  private static debugCache: DebugCache = {};
  private static pinoLogger = pino();
  private static getDebug(namespace: string): createDebug.Debugger {
    const ns = `eventuras:${namespace}`;
    const exists = ns in Logger.debugCache;
    if (!exists) {
      Logger.debugCache[ns] = createDebug(ns);
    }
    return Logger.debugCache[ns]!;
  }

  private static wrapLogger(
    pinoFunction: (obj: any, msg?: string | undefined) => void,
  ) {
    return (
      options: LoggerOptions = { developerOnly: false, namespace: '' },
      ...msg: any | any[]
    ) => {
      if (options.developerOnly && process.env.NODE_ENV !== 'development') {
        return;
      }
      //use pino outside of dev environment, and debug inside of it to avoid double logging locally
      if (process.env.NODE_ENV !== 'development') {
        pinoFunction({ namespace: options.namespace, msg: msg });
      } else {
        Logger.getDebug(options.namespace ?? '')(msg);
      }
    };
  }

  static error = Logger.wrapLogger(
    Logger.pinoLogger.error.bind(Logger.pinoLogger),
  ).bind(Logger);
  static warn = Logger.wrapLogger(
    Logger.pinoLogger.warn.bind(Logger.pinoLogger),
  ).bind(Logger);
  static info = Logger.wrapLogger(
    Logger.pinoLogger.info.bind(Logger.pinoLogger),
  ).bind(Logger);
  static debug = Logger.wrapLogger(
    Logger.pinoLogger.debug.bind(Logger.pinoLogger),
  ).bind(Logger);
  static fatal = Logger.wrapLogger(
    Logger.pinoLogger.fatal.bind(Logger.pinoLogger),
  ).bind(Logger);
}

export default Logger;

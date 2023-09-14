/**
 * Wrapper class for debug-js. Meant to ease logging, and future-proof possible usage of different logging frameworks.
 * Uses namespaces to enable or disable logging. See https://www.npmjs.com/package/debug for more information.
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

import Environment, { EnvironmentVariables } from './Environment';
interface DebugCache {
  [key: string]: createDebug.Debugger;
}
export type LoggerOptions = {
  developerOnly?: boolean;
  namespace?: string;
};

class Logger {
  private static debugCache: DebugCache = {};

  private static getDebug(namespace: string): createDebug.Debugger {
    const ns = `eventuras:${namespace}`;
    const exists = ns in this.debugCache;
    if (!exists) {
      this.debugCache[ns] = createDebug(ns);
    }
    return this.debugCache[ns];
  }
  private static generic(
    options: LoggerOptions = { developerOnly: false, namespace: '' },
    ...msg: any | any[]
  ) {
    if (options.developerOnly && Environment.get(EnvironmentVariables.NODE_ENV) !== 'development') {
      return;
    }

    this.getDebug(options.namespace ?? '')(msg);
  }

  static error = this.generic.bind(this);
  static warn = this.generic.bind(this);
  static info = this.generic.bind(this);
  static http = this.generic.bind(this);
  static verbose = this.generic.bind(this);
  static debug = this.generic.bind(this);
  static silly = this.generic.bind(this);
}

export default Logger;

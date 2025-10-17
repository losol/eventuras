/**
 * Debug utility using debug-js for namespace-based logging in development.
 *
 * This is separate from the Logger and uses only debug-js for console-based debugging.
 * Use this for development-only debugging, not for production logging.
 *
 * Enable with DEBUG env var:
 * DEBUG=eventuras:* (all namespaces)
 * DEBUG=eventuras:auth* (specific namespace pattern)
 *
 * In the browser, set localStorage:
 * localStorage.debug = 'eventuras:*'
 *
 * @example
 * import { Debug } from '@eventuras/logger';
 *
 * const debug = Debug.create('CollectionEditor');
 * debug('Loading collection...');
 * debug('Collection loaded:', collection);
 */
import createDebug from 'debug';

interface DebugCache {
  [key: string]: createDebug.Debugger;
}

export class Debug {
  private static cache: DebugCache = {};
  private debugInstance: createDebug.Debugger;

  private constructor(namespace: string) {
    this.debugInstance = Debug.getDebugger(namespace);
  }

  private static getDebugger(namespace: string): createDebug.Debugger {
    const ns = `eventuras:${namespace}`;
    if (!(ns in Debug.cache)) {
      Debug.cache[ns] = createDebug(ns);
    }
    return Debug.cache[ns]!;
  }

  /**
   * Create a debug instance for a specific namespace.
   *
   * @param namespace - The namespace for this debugger (e.g., 'CollectionEditor')
   * @returns A debug instance that can be called like a function
   *
   * @example
   * const debug = Debug.create('API');
   * debug('Request received:', req);
   * debug('Processing...');
   */
  static create(namespace: string): createDebug.Debugger {
    return Debug.getDebugger(namespace);
  }

  /**
   * Quick debug call for one-off debugging.
   *
   * @param namespace - The namespace for this debug message
   * @param message - Primary message to log
   * @param args - Additional arguments to log
   *
   * @example
   * Debug.log('CollectionEditor', 'Something happened', { data: 123 });
   */
  static log(namespace: string, message?: any, ...args: any[]): void {
    const dbg = Debug.getDebugger(namespace);
    dbg(message, ...args);
  }

  /**
   * Enable debug output for specific namespaces.
   *
   * @param namespaces - Comma-separated list of namespaces (supports wildcards)
   *
   * @example
   * Debug.enable('eventuras:*'); // Enable all
   * Debug.enable('eventuras:auth*,eventuras:api*'); // Enable specific
   */
  static enable(namespaces: string): void {
    createDebug.enable(namespaces);
  }

  /**
   * Disable debug output.
   */
  static disable(): void {
    createDebug.disable();
  }

  /**
   * Check if a namespace is currently enabled.
   *
   * @param namespace - The namespace to check
   */
  static isEnabled(namespace: string): boolean {
    return Debug.getDebugger(namespace).enabled;
  }
}

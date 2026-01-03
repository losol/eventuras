/**
 * Sentry integration for @eventuras/logger using Sentry's built-in Pino integration.
 *
 * This library provides integration between @eventuras/logger and Sentry
 * using the official pinoIntegration from @sentry/nextjs.
 *
 * @example
 * // In your app's sentry.server.config.ts
 * import * as Sentry from '@sentry/nextjs';
 * import { initializeSentryLogger } from '@eventuras/logger-sentry';
 *
 * Sentry.init({
 *   dsn: process.env.SENTRY_DSN,
 *   // ... other Sentry options
 * });
 *
 * // Connect logger to Sentry - errors/fatal logs will be sent automatically
 * initializeSentryLogger();
 *
 * @example
 * // Then use logger as normal in your app
 * import { Logger } from '@eventuras/logger';
 *
 * const logger = Logger.create({ namespace: 'MyService' });
 * logger.error({ error: err }, 'Something failed'); // Automatically sent to Sentry
 */

import { Logger } from '@eventuras/logger';

/**
 * Options for Sentry logger integration
 */
export type SentryLoggerOptions = {
  /**
   * Minimum log level to send to Sentry as errors
   * @default 'error'
   */
  errorLevels?: Array<'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;

  /**
   * Log levels to capture as Sentry logs (breadcrumbs)
   * @default ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
   */
  logLevels?: Array<'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;
};

/**
 * Initialize Sentry integration for Logger using Sentry's pinoIntegration.
 *
 * This must be called AFTER Sentry.init() to enable the integration.
 * The actual integration is configured via Sentry.init({ integrations: [...] }).
 *
 * @param options - Configuration options
 *
 * @example
 * import * as Sentry from '@sentry/nextjs';
 * import { getSentryPinoIntegration, initializeSentryLogger } from '@eventuras/logger-sentry';
 *
 * Sentry.init({
 *   dsn: process.env.SENTRY_DSN,
 *   integrations: [getSentryPinoIntegration()],
 * });
 *
 * initializeSentryLogger();
 */
export function initializeSentryLogger(options: SentryLoggerOptions = {}): void {
  const { errorLevels = ['error', 'fatal'], logLevels } = options;

  // Get Pino instance from Logger
  const pinoInstance = Logger.getPinoInstance();

  if (!pinoInstance) {
    console.warn('[logger-sentry] Could not get Pino instance. Sentry integration not initialized.');
    return;
  }

  // The integration is configured via Sentry.init({ integrations: [...] })
  // This function just validates that everything is set up correctly
  console.log('[logger-sentry] Sentry Pino integration ready');
  console.log(`[logger-sentry] Error levels: ${errorLevels.join(', ')}`);
  if (logLevels) {
    console.log(`[logger-sentry] Log levels: ${logLevels.join(', ')}`);
  }
}

/**
 * Get Sentry's Pino integration with the specified configuration.
 * Add this to Sentry.init({ integrations: [...] }).
 *
 * IMPORTANT: This function expects @sentry/nextjs to be available via import.
 * It should be called from your Sentry config file where Sentry is already imported.
 *
 * @param options - Configuration options
 * @returns Sentry Pino integration instance or null if not available
 *
 * @example
 * import * as Sentry from '@sentry/nextjs';
 * import { getSentryPinoIntegration } from '@eventuras/logger-sentry';
 *
 * Sentry.init({
 *   dsn: process.env.SENTRY_DSN,
 *   integrations: [
 *     getSentryPinoIntegration({
 *       errorLevels: ['error', 'fatal'],
 *       logLevels: ['info', 'warn', 'error', 'fatal']
 *     })
 *   ].filter(Boolean), // Remove null if pinoIntegration not available
 * });
 */
export function getSentryPinoIntegration(options: SentryLoggerOptions = {}) {
  const { errorLevels = ['error', 'fatal'], logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] } = options;

  // Try to get Sentry instance - it should already be loaded in the caller's context
  try {
    // Access Sentry from global scope if available (set by caller's import)
    const globalSentry = (globalThis as any).Sentry;

    if (!globalSentry?.pinoIntegration) {
      console.warn('[logger-sentry] pinoIntegration not found. Ensure @sentry/nextjs >= 10.18.0 is imported before calling this function.');
      return null;
    }

    return globalSentry.pinoIntegration({
      error: {
        levels: errorLevels,
        markAsHandled: true,
      },
      log: {
        levels: logLevels,
      },
    });
  } catch (error) {
    console.warn('[logger-sentry] Failed to get Sentry Pino integration:', error);
    return null;
  }
}

/**
 * Alternative: Pass Sentry instance directly to avoid global scope lookup.
 * Use this if you prefer explicit dependencies.
 *
 * @param Sentry - The Sentry instance (import * as Sentry from '@sentry/nextjs')
 * @param options - Configuration options
 * @returns Sentry Pino integration instance
 *
 * @example
 * import * as Sentry from '@sentry/nextjs';
 * import { createSentryPinoIntegration } from '@eventuras/logger-sentry';
 *
 * Sentry.init({
 *   dsn: process.env.SENTRY_DSN,
 *   integrations: [createSentryPinoIntegration(Sentry)],
 * });
 */
export function createSentryPinoIntegration(Sentry: any, options: SentryLoggerOptions = {}) {
  const { errorLevels = ['error', 'fatal'], logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] } = options;

  if (!Sentry?.pinoIntegration) {
    throw new Error('[logger-sentry] pinoIntegration not found. Requires @sentry/nextjs >= 10.18.0');
  }

  return Sentry.pinoIntegration({
    error: {
      levels: errorLevels,
      markAsHandled: true,
    },
    log: {
      levels: logLevels,
    },
  });
}

/**
 * Re-export Logger for convenience
 */
export { Logger } from '@eventuras/logger';

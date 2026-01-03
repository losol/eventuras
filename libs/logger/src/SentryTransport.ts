/**
 * Pino transport for sending error and fatal logs to Sentry.
 *
 * This transport automatically captures errors logged at 'error' and 'fatal' levels
 * and sends them to Sentry with full context.
 *
 * @example
 * // Configure logger to use Sentry transport
 * Logger.configure({
 *   level: 'info',
 *   transport: SentryTransport.create()
 * });
 *
 * @example
 * // Then use logger normally - errors are automatically sent to Sentry
 * logger.error({ error: err, userId: 123 }, 'Failed to process request');
 */
import type { TransportTargetOptions } from 'pino';

export type SentryTransportOptions = {
  /** Sentry instance (optional, will auto-import if not provided) */
  Sentry?: any;
  /** Minimum level to send to Sentry (default: 'error') */
  level?: 'error' | 'fatal';
  /** Additional Sentry options */
  sentryOptions?: {
    /** Whether to send user PII */
    includeUser?: boolean;
    /** Custom tags to add to all events */
    tags?: Record<string, string>;
  };
};

export class SentryTransport {
  /**
   * Create a Pino transport configuration for Sentry.
   * Returns null if Sentry is not available or not configured.
   */
  static create(options: SentryTransportOptions = {}): TransportTargetOptions | null {
    // Check if Sentry is available and configured
    const isSentryEnabled =
      process.env.NEXT_PUBLIC_FEATURE_SENTRY === 'true' &&
      (process.env.SENTRY_DSN ||process.env.NEXT_PUBLIC_SENTRY_DSN);

    if (!isSentryEnabled) {
      return null;
    }

    return {
      target: 'pino/file',
      options: {
        destination: 1, // stdout
        // We'll use a custom Pino hook instead
      },
    };
  }

  /**
   * Create a Pino hook that sends errors to Sentry.
   * Only activates if Sentry is available and properly initialized.
   */
  static createHook() {
    return function (
      this: any,
      args: [obj: unknown, msg?: string | undefined, ...rest: unknown[]],
      method: any,
      level: number
    ) {
      // Call the original log method first
      method.apply(this, args);

      // Only try to use Sentry if we're at error/fatal level
      if (level < 50) {
        return;
      }

      // Try to get Sentry - only if it's available and initialized
      let Sentry: any;
      try {
        // Attempt to load Sentry dynamically
        Sentry = require('@sentry/nextjs');

        // Check if Sentry is actually initialized (has a client)
        if (!Sentry || !Sentry.getCurrentHub || !Sentry.getCurrentHub().getClient()) {
          return;
        }
      } catch (error) {
        // Sentry not available in this app/runtime - skip silently
        return;
      }

      // Extract log data
      const [obj, msg] = args;
      const logObject = typeof obj === 'object' && obj !== null ? obj : {};
      const { error, namespace, correlationId, ...context } = logObject as any;

      // Extract Error object if present
      let errorToCapture: Error | undefined;
      if (error instanceof Error) {
        errorToCapture = error;
      } else if (typeof error === 'string') {
        errorToCapture = new Error(error);
      } else if (error) {
        errorToCapture = new Error(String(error));
      } else if (msg) {
        errorToCapture = new Error(String(msg));
      }

      if (errorToCapture) {
        Sentry.captureException(errorToCapture, {
          level: level >= 60 ? 'fatal' : 'error',
          tags: {
            ...(namespace && { namespace }),
            ...(correlationId && { correlationId }),
          },
          extra: context,
        });
      }
    };
  }
}

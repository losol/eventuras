/**
 * OpenTelemetry integration for @eventuras/logger
 *
 * This module provides integration between Pino and OpenTelemetry Logs API.
 * It allows sending logs to any OpenTelemetry-compatible backend (Sentry, Grafana, Jaeger, etc.)
 * without vendor lock-in.
 *
 * NOTE: This module requires OpenTelemetry packages to be installed as peer dependencies.
 * If they are not available, the integration will gracefully disable itself.
 *
 * @example
 * // In your app's instrumentation.ts or main entry point
 * import { setupOpenTelemetryLogger } from '@eventuras/logger/opentelemetry';
 * import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
 * import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
 *
 * setupOpenTelemetryLogger({
 *   logRecordProcessor: new BatchLogRecordProcessor(
 *     new OTLPLogExporter({
 *       url: 'https://[org].ingest.sentry.io/api/[project]/integration/otlp/v1/logs',
 *       headers: { 'x-sentry-auth': 'sentry sentry_key=...' }
 *     })
 *   )
 * });
 *
 * @example
 * // Then use logger as normal
 * import { Logger } from '@eventuras/logger';
 *
 * const logger = Logger.create({ namespace: 'MyService' });
 * logger.error({ error: err }, 'Something failed'); // Sent to OpenTelemetry backend
 */

/**
 * Minimal interface for an OpenTelemetry LogRecordProcessor.
 * Compatible with `@opentelemetry/sdk-logs` `LogRecordProcessor`.
 * Defined locally to avoid requiring OTel types at compile time.
 */
export interface LogRecordProcessor {
  shutdown(): Promise<void>;
  forceFlush(): Promise<void>;
}

/**
 * Minimal interface for an OpenTelemetry LoggerProvider.
 * Compatible with `@opentelemetry/sdk-logs` `LoggerProvider`.
 */
export interface OTelLoggerProvider {
  addLogRecordProcessor(processor: LogRecordProcessor): void;
  shutdown(): Promise<void>;
  forceFlush?(): Promise<void>;
}

/** Internal interface for Pino instrumentation */
interface PinoInstrumentationInstance {
  enable(): void;
  disable(): void;
}

// Lazy load OpenTelemetry packages to handle optional peer dependencies
async function loadOpenTelemetry() {
  try {
    const [pinoModule, logsModule] = await Promise.all([
      import('@opentelemetry/instrumentation-pino'),
      import('@opentelemetry/sdk-logs'),
    ]);
    return {
      PinoInstrumentation: pinoModule.PinoInstrumentation,
      LoggerProvider: logsModule.LoggerProvider
    };
  } catch {
    return null;
  }
}

/**
 * Options for OpenTelemetry logger integration
 */
export type OpenTelemetryLoggerOptions = {
  /**
   * Log record processor (e.g., BatchLogRecordProcessor with an exporter).
   * If not provided, logs will only be instrumented but not exported.
   */
  logRecordProcessor?: LogRecordProcessor;

  /**
   * Logger provider instance. If not provided, a new one will be created.
   */
  loggerProvider?: OTelLoggerProvider;

  /**
   * Service name to attach to log records.
   * Defaults to the `OTEL_SERVICE_NAME` environment variable, or `'unknown-service'`.
   */
  serviceName?: string;

  /**
   * Whether to enable the integration. Default: true
   */
  enabled?: boolean;
};

let pinoInstrumentation: PinoInstrumentationInstance | null = null;
let loggerProvider: OTelLoggerProvider | null = null;

/**
 * Set up OpenTelemetry integration for Pino logger.
 *
 * This function:
 * 1. Creates or uses provided LoggerProvider
 * 2. Registers the log record processor (for exporting logs)
 * 3. Enables Pino instrumentation to bridge Pino logs to OTel
 *
 * Call this function once at application startup, before creating any loggers.
 *
 * @param options - Configuration options
 *
 * @example
 * // Send to Sentry via OTLP
 * import { setupOpenTelemetryLogger } from '@eventuras/logger';
 * import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
 * import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
 *
 * setupOpenTelemetryLogger({
 *   logRecordProcessor: new BatchLogRecordProcessor(
 *     new OTLPLogExporter({
 *       url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
 *       headers: {
 *         'x-sentry-auth': `sentry sentry_key=${process.env.SENTRY_KEY}`
 *       }
 *     })
 *   )
 * });
 *
 * @example
 * // Use environment variables (recommended)
 * // Set these in your environment:
 * // OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://[org].ingest.sentry.io/api/[project]/integration/otlp/v1/logs
 * // OTEL_EXPORTER_OTLP_LOGS_HEADERS=x-sentry-auth=sentry sentry_key=...
 *
 * import { setupOpenTelemetryLogger } from '@eventuras/logger';
 * import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
 * import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
 *
 * await setupOpenTelemetryLogger({
 *   logRecordProcessor: new BatchLogRecordProcessor(
 *     new OTLPLogExporter() // Reads from env vars
 *   )
 * });
 */
export async function setupOpenTelemetryLogger(
  options: OpenTelemetryLoggerOptions = {}
): Promise<void> {
  // Check if we're running in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('[logger] OpenTelemetry integration is server-side only - skipping in browser');
    return;
  }

  const {
    logRecordProcessor,
    loggerProvider: providedLoggerProvider,
    serviceName,
    enabled = true,
  } = options;

  if (!enabled) {
    console.log('[logger] OpenTelemetry integration disabled');
    return;
  }

  // Lazy load OpenTelemetry packages
  const otel = await loadOpenTelemetry();

  if (!otel) {
    console.warn('[logger] OpenTelemetry packages not available - integration disabled');
    console.warn('[logger] Install @opentelemetry/* packages to enable OpenTelemetry integration');
    return;
  }

  const { PinoInstrumentation, LoggerProvider } = otel;

  // Clean up existing instrumentation if re-initializing
  if (pinoInstrumentation) {
    pinoInstrumentation.disable();
    pinoInstrumentation = null;
  }

  // Create or use provided logger provider
  loggerProvider = (providedLoggerProvider ?? new LoggerProvider()) as OTelLoggerProvider;

  // Register log record processor if provided
  if (logRecordProcessor && loggerProvider) {
    loggerProvider.addLogRecordProcessor(logRecordProcessor);
  }

  // Resolve service name from option, env var, or fallback
  const resolvedServiceName =
    serviceName ??
    (typeof process !== 'undefined' ? process.env?.OTEL_SERVICE_NAME : undefined) ??
    'unknown-service';

  // Enable Pino instrumentation to bridge Pino logs to OpenTelemetry
  pinoInstrumentation = new PinoInstrumentation({
    logHook: (_span: unknown, record: Record<string, unknown>) => {
      record['service.name'] = resolvedServiceName;
    },
  }) as PinoInstrumentationInstance;

  pinoInstrumentation.enable();

  console.log('[logger] OpenTelemetry integration enabled');
  if (logRecordProcessor) {
    console.log('[logger] Log record processor registered');
  }
}

/**
 * Shut down the OpenTelemetry logger integration.
 * Call this when your application is shutting down to flush any pending logs.
 *
 * @example
 * process.on('SIGTERM', async () => {
 *   await shutdownOpenTelemetryLogger();
 *   process.exit(0);
 * });
 */
export async function shutdownOpenTelemetryLogger(): Promise<void> {
  // Check if we're running in a browser environment
  if (typeof window !== 'undefined') {
    return;
  }

  if (pinoInstrumentation) {
    pinoInstrumentation.disable();
    pinoInstrumentation = null;
  }

  if (loggerProvider) {
    await loggerProvider.shutdown();
    loggerProvider = null;
  }

  console.log('[logger] OpenTelemetry integration shut down');
}

/**
 * Get the active LoggerProvider instance, if any.
 * Useful for advanced use cases or debugging.
 */
export function getLoggerProvider(): OTelLoggerProvider | null {
  // Return null if in browser environment
  if (typeof window !== 'undefined') {
    return null;
  }

  return loggerProvider;
}

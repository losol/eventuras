// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import * as Sentry from '@sentry/nextjs';

import { setupOpenTelemetryLogger } from '@eventuras/logger/opentelemetry';

const isSentryEnabled = process.env.NEXT_PUBLIC_FEATURE_SENTRY === 'true';
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (isSentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information).
    // Can be controlled via NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII ('true' to enable, 'false' to disable).
    sendDefaultPii: process.env.NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII
      ? process.env.NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII === 'true'
      : true,
  });

  console.log('[Sentry] Server-side initialized successfully');
} else {
  console.log(
    `[Sentry] Server-side disabled (NEXT_PUBLIC_FEATURE_SENTRY=${process.env.NEXT_PUBLIC_FEATURE_SENTRY}, has DSN=${!!sentryDsn})`
  );
}

// Set up OpenTelemetry logger integration
// This sends logs to Sentry via OTLP if configured, or can be switched to any other OTLP-compatible backend
const otlpLogsEndpoint = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
const otlpLogsHeaders = process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS;

if (otlpLogsEndpoint) {
  const headers: Record<string, string> = {};

  // Parse headers from environment variable (format: "key1=value1,key2=value2")
  if (otlpLogsHeaders) {
    otlpLogsHeaders.split(',').forEach(header => {
      const [key, value] = header.split('=');
      if (key && value) {
        headers[key.trim()] = value.trim();
      }
    });
  }

  setupOpenTelemetryLogger({
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: otlpLogsEndpoint,
        headers,
      })
    ),
  });

  console.log(`[OpenTelemetry] Logger initialized - sending to ${otlpLogsEndpoint}`);
} else {
  console.log('[OpenTelemetry] Logger not configured (OTEL_EXPORTER_OTLP_LOGS_ENDPOINT not set)');
}

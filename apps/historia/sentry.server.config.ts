// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { createSentryPinoIntegration } from '@eventuras/logger-sentry';

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

    // Integrations
    integrations: [
      // Pino logger integration - captures error/fatal logs from @eventuras/logger
      createSentryPinoIntegration(Sentry, {
        errorLevels: ['error', 'fatal'], // Send errors and fatal logs as Sentry errors
        logLevels: ['info', 'warn', 'error', 'fatal'], // Include info+ as breadcrumbs
      }),
    ],
  });

  console.log('[Sentry] Server-side initialized successfully with Pino integration');
} else {
  console.log(
    `[Sentry] Server-side disabled (NEXT_PUBLIC_FEATURE_SENTRY=${process.env.NEXT_PUBLIC_FEATURE_SENTRY}, has DSN=${!!sentryDsn})`
  );
}

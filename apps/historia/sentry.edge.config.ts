// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

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
      : false,
  });

  console.log('[Sentry] Edge runtime initialized successfully');
} else {
  console.log(
    `[Sentry] Edge runtime disabled (NEXT_PUBLIC_FEATURE_SENTRY=${process.env.NEXT_PUBLIC_FEATURE_SENTRY}, has DSN=${!!sentryDsn})`
  );
}

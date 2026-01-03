// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
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

  console.log('[Sentry] Client-side initialized successfully');
} else {
  console.log(
    `[Sentry] Client-side disabled (NEXT_PUBLIC_FEATURE_SENTRY=${process.env.NEXT_PUBLIC_FEATURE_SENTRY}, has DSN=${!!sentryDsn})`
  );
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

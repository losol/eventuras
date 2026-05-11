import * as Sentry from '@sentry/nextjs';

const isSentryEnabled = process.env.NEXT_PUBLIC_FEATURE_SENTRY === 'true';
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (isSentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    enableLogs: true,
    sendDefaultPii: process.env.NEXT_PUBLIC_WEB_SENTRY_SEND_DEFAULT_PII
      ? process.env.NEXT_PUBLIC_WEB_SENTRY_SEND_DEFAULT_PII === 'true'
      : true,
  });

  console.log('[Sentry] Server-side initialized successfully');
} else {
  console.log(
    `[Sentry] Server-side disabled (NEXT_PUBLIC_FEATURE_SENTRY=${process.env.NEXT_PUBLIC_FEATURE_SENTRY}, has DSN=${!!sentryDsn})`
  );
}

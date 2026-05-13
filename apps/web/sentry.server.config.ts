import * as Sentry from '@sentry/nextjs';

import { appConfig } from './src/config.server';

const isSentryEnabled = appConfig.env.SENTRY_ENABLED === true;
const sentryDsn = appConfig.env.SENTRY_DSN as string | undefined;

if (isSentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    enableLogs: true,
    sendDefaultPii: appConfig.env.SENTRY_SEND_DEFAULT_PII !== false,
  });

  console.log('[Sentry] Server-side initialized successfully');
} else {
  console.log(
    `[Sentry] Server-side disabled (SENTRY_ENABLED=${isSentryEnabled}, has DSN=${!!sentryDsn})`
  );
}

import * as Sentry from '@sentry/nextjs';

import { appConfig } from './src/config.server';
import { sentryDataCollection } from './src/providers/sentry/dataCollection';

const isSentryEnabled = appConfig.env.SENTRY_ENABLED === true;
const sentryDsn = appConfig.env.SENTRY_DSN as string | undefined;
const release =
  process.env.BUILD_GIT_SHA && process.env.BUILD_GIT_SHA !== 'unknown'
    ? process.env.BUILD_GIT_SHA
    : undefined;

if (isSentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    dataCollection: sentryDataCollection(appConfig.env.SENTRY_SEND_DEFAULT_PII !== false),
    release,
  });

  console.log('[Sentry] Server-side initialized successfully');
} else {
  console.log(
    `[Sentry] Server-side disabled (SENTRY_ENABLED=${isSentryEnabled}, has DSN=${!!sentryDsn})`
  );
}

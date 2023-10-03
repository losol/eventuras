// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import Environment, { EnvironmentVariables } from '@/utils/Environment';
import Logger from '@/utils/Logger';

if (Environment.get(EnvironmentVariables.FEATURE_SENTRY_DSN)) {
  Logger.info({}, 'Sentry DSN found, initializing Sentry on client side.');
  Sentry.init({
    dsn: Environment.get(EnvironmentVariables.FEATURE_SENTRY_DSN),
    tracesSampleRate: 0.1,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

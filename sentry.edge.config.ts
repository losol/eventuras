// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

if (Environment.FEATURE_SENTRY_DSN) {
  Logger.info({}, 'Sentry DSN found, initializing Sentry on the edge.');
  Sentry.init({
    dsn: Environment.FEATURE_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
  });
}

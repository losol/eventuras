// Sentry server side configuration

import * as Sentry from '@sentry/nextjs';

import Environment from '@/utils/Environment';

Sentry.init({
  dsn: Environment.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  debug: false,
});

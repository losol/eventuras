// Sentry edge configuration
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import Environment from '@/utils/Environment';

Sentry.init({
  dsn: Environment.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});

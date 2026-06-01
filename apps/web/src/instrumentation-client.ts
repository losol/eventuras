import * as Sentry from '@sentry/nextjs';

import { isBot } from '@eventuras/core/useragents';

import type { SentryClientConfig } from '@/providers/sentry';

declare global {
  interface Window {
    __SENTRY_CONFIG__?: SentryClientConfig;
  }
}

const config = typeof window === 'undefined' ? undefined : window.__SENTRY_CONFIG__;
const userAgent = typeof navigator === 'undefined' ? undefined : navigator.userAgent;

if (isBot(userAgent)) {
  console.log('[Sentry] Client-side disabled (bot user agent detected)');
} else if (config?.dsn) {
  Sentry.init({
    dsn: config.dsn,
    enableLogs: true,
    sendDefaultPii: config.sendDefaultPii,
    release: config.release,
  });

  console.log('[Sentry] Client-side initialized successfully');
} else {
  console.log(
    `[Sentry] Client-side disabled (has window.__SENTRY_CONFIG__=${!!config}, has DSN=${!!config?.dsn})`
  );
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

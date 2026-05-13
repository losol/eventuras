import Script from 'next/script';

import { appConfig } from '@/config.server';

export type SentryClientConfig = {
  dsn: string;
  sendDefaultPii: boolean;
  release?: string;
};

declare global {
  interface Window {
    __SENTRY_CONFIG__?: SentryClientConfig;
  }
}

/**
 * Reads the Sentry DSN at request time and pushes it onto the page as
 * `window.__SENTRY_CONFIG__`. Runs before the Next.js bundle hydrates, so
 * `instrumentation-client.ts` can pick the value up and call `Sentry.init`.
 *
 * Keeps the DSN out of the build artifact (no NEXT_PUBLIC_* required), so
 * the same Docker image can be redeployed to different environments with
 * different DSNs supplied at container start time.
 */
export const InitSentry = () => {
  const enabled = appConfig.env.SENTRY_ENABLED === true;
  const dsn = appConfig.env.SENTRY_DSN as string | undefined;

  if (!enabled || !dsn) {
    return null;
  }

  const release = process.env.BUILD_GIT_SHA;

  const config: SentryClientConfig = {
    dsn,
    sendDefaultPii: appConfig.env.SENTRY_SEND_DEFAULT_PII === true,
    ...(release && release !== 'unknown' ? { release } : {}),
  };

  return (
    <Script id="sentry-config" strategy="beforeInteractive">
      {`window.__SENTRY_CONFIG__ = ${JSON.stringify(config)};`}
    </Script>
  );
};

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

  // `<Script strategy="beforeInteractive">` queues into __next_s and runs
  // after the client bundle, so `instrumentation-client.ts` would read
  // `window.__SENTRY_CONFIG__` as undefined. An inline `<script>` executes
  // synchronously at parse time, before any module.
  //
  // Escape HTML-significant characters so a value containing `</script>`
  // can't terminate the tag and inject markup, even though every field
  // comes from server-side env.
  const json = JSON.stringify(config)
    .replaceAll('<', String.raw`\u003c`)
    .replaceAll('>', String.raw`\u003e`)
    .replaceAll('&', String.raw`\u0026`);

  return (
    <script
      id="sentry-config"
      dangerouslySetInnerHTML={{
        __html: `window.__SENTRY_CONFIG__ = ${json};`,
      }}
    />
  );
};

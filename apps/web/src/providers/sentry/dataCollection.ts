import type * as Sentry from '@sentry/nextjs';

type DataCollection = NonNullable<NonNullable<Parameters<typeof Sentry.init>[0]>['dataCollection']>;

/**
 * Sentry 11 replaced `sendDefaultPii` with `dataCollection`, which collects
 * request bodies and local variables by default. Keep what we send close to
 * what Sentry 10 sent: `sendDefaultPii` only turns on user info, cookies,
 * headers and query params, and bodies and local variables stay off either way.
 */
export const sentryDataCollection = (sendDefaultPii: boolean): DataCollection => ({
  userInfo: sendDefaultPii,
  cookies: sendDefaultPii,
  httpHeaders: sendDefaultPii,
  urlQueryParams: sendDefaultPii,
  httpBodies: [],
  stackFrameVariables: false,
});

import { createFidesAuth } from '@eventuras/fides-auth-next';

import { fidesLogger } from '@/auth/fidesLogger';
import { appConfig } from '@/config.server';
import { applicationUrl, oauthConfig, sessionSecret } from '@/utils/oauthConfig';

/** LOGOUT_URL_REDIRECT, resolved against the app; undefined falls back to the app's origin. */
function postLogoutRedirectUri(): string | undefined {
  const target = appConfig.env.LOGOUT_URL_REDIRECT as string | undefined;
  return target && applicationUrl ? new URL(target, applicationUrl).toString() : undefined;
}

/** Session helpers and auth route handlers, bound to the app's secret and OIDC config. */
export const auth = createFidesAuth({
  oauthConfig,
  secret: sessionSecret,
  applicationUrl,
  rolesClaim: (appConfig.env.OIDC_ROLES_CLAIM as string) || 'roles',
  postLogoutRedirectUri: postLogoutRedirectUri(),
  logger: fidesLogger,
});

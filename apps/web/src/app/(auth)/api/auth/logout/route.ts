import { handleOidcLogout } from '@eventuras/fides-auth-next/oidc-logout';

import { appConfig } from '@/config.server';
import { oauthConfig } from '@/utils/oauthConfig';

/**
 * RP-initiated logout: clears all session cookies and redirects to the
 * provider's end-session endpoint with `id_token_hint`. POST-only.
 */
export async function POST(request: Request): Promise<Response> {
  const applicationUrl = String(appConfig.env.APPLICATION_URL ?? '');
  const postLogoutRedirectUri = new URL(
    String(appConfig.env.LOGOUT_URL_REDIRECT ?? '/'),
    applicationUrl
  ).toString();

  return handleOidcLogout(request, {
    oauthConfig,
    postLogoutRedirectUri,
    applicationUrl,
  });
}

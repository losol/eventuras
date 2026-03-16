import { handleOidcCallback } from '@eventuras/fides-auth-next/oidc-callback';

import { appConfig } from '@/config.server';
import { oauthConfig } from '@/utils/oauthConfig';

export async function GET(request: Request): Promise<Response> {
  return handleOidcCallback(request, {
    oauthConfig,
    applicationUrl: appConfig.env.APPLICATION_URL as string,
    rolesClaim: (appConfig.env.OIDC_ROLES_CLAIM as string) || 'roles',
  });
}

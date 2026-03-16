import { handleOidcLogin } from '@eventuras/fides-auth-next/oidc-login';

import { oauthConfig } from '@/utils/oauthConfig';

export async function GET(request: Request): Promise<Response> {
  return handleOidcLogin(request, { oauthConfig });
}

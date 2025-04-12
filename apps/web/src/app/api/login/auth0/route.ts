import { buildAuthorizationUrl, buildPKCEOptions } from '@eventuras/fides-auth/oauth';
import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { cookies } from 'next/headers';

import { oauthConfig } from '@/utils/oauthConfig';

export async function GET(): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response('Too many requests', { status: 429 });
  }
  const pkce = await buildPKCEOptions(oauthConfig);
  const authorizationUrl = await buildAuthorizationUrl(oauthConfig, pkce);

  // Store state and code verifier in cookies for later validation
  (await cookies()).set('oauth_state', pkce.state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });
  (await cookies()).set('oauth_code_verifier', pkce.code_verifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  // Redirect the client to the Auth0 authorization URL
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl.toString(),
    },
  });
}

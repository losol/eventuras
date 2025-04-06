import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { auth0, getAuth0ClientConfig } from '@/lib/auth/oauth';
import { globalGETRateLimit } from '@/lib/auth/request';

export async function GET(): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response('Too many requests', { status: 429 });
  }

  const config: openid.Configuration = await getAuth0ClientConfig();

  // Generate state and PKCE parameters using openid-client's generators
  let code_verifier: string = openid.randomPKCECodeVerifier();
  let code_challenge = await openid.calculatePKCECodeChallenge(code_verifier);
  let state: string = openid.randomState();

  const parameters: Record<string, string> = {
    redirect_uri: auth0.callback_url,
    scope: 'openid profile email offline_access',
    code_challenge,
    code_challenge_method: 'S256',
    state,
  };

  // Build the authorization URL using the client
  const authorizationUrl = await openid.buildAuthorizationUrl(config, parameters);
  console.log('Authorization URL:', authorizationUrl);

  // Store state and code verifier in cookies for later validation
  cookies().set('oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });
  cookies().set('oauth_code_verifier', code_verifier, {
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

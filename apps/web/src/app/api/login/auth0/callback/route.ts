import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { createSession } from '@eventuras/fides-auth/session';
import { Logger } from '@eventuras/utils';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import Environment from '@/utils/Environment';
import { oauthConfig, redirect_uri } from '@/utils/oauthConfig';

export async function GET(request: Request): Promise<Response> {
  // Rate limit the request to avoid abuse
  if (!globalGETRateLimit()) {
    Logger.warn({ namespace: 'login:auth0' }, 'Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  // use the public url when sending to auth0
  const current_url = new URL(request.url);
  const public_url = new URL(Environment.NEXT_PUBLIC_APPLICATION_URL);
  public_url.search = current_url.search;

  const storedState = (await cookies()).get('oauth_state')?.value ?? null;
  const storedCodeVerifier = (await cookies()).get('oauth_code_verifier')?.value ?? null;

  if (!storedState || !storedCodeVerifier) {
    Logger.warn({ namespace: 'login:auth0' }, 'Missing stored state or code verifier');
    return new Response('Please restart the process.', { status: 400 });
  }

  const tokenEndpointParameters: Record<string, string> = {
    redirect_uri: redirect_uri,
  };

  Logger.debug({ namespace: 'login:auth0' }, `Requesting tokens.`);
  const auth0config = await openid.discovery(
    new URL(oauthConfig.issuer),
    oauthConfig.clientId,
    oauthConfig.clientSecret
  );
  try {
    const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
      auth0config,
      public_url,
      {
        pkceCodeVerifier: storedCodeVerifier.toString(),
        expectedState: storedState.toString(),
      },
      tokenEndpointParameters
    );

    const decodedIdToken = decodeJwt(tokens.id_token ?? '');

    const jwt = await createSession(
      {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        tokens: {
          accessToken: tokens.access_token,
          // if tokens.expires_in exists, set the access token expiration time
          accessTokenExpiresAt: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : undefined,
          refreshToken: tokens.refresh_token,
        },
        user: {
          name: decodedIdToken.name as string,
          email: decodedIdToken.email as string,
          roles:
            Array.from(
              decodedIdToken[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ] as string
            ) ?? [],
        },
      },
      { sessionDurationDays: 7 }
    );

    // Set the session cookie
    (await cookies()).set('session', jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  } catch (error) {
    Logger.error({ namespace: 'login:auth0', error }, 'Unexpected error in Auth0 callback');
    return new Response('An unexpected error occurred. Please restart the process.', {
      status: 500,
    });
  }
}

import {globalGETRateLimit} from '@eventuras/fides-auth-next/request';
import {createSession} from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/utils/src/Logger';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import Environment from '@/utils/Environment';
import { oauthConfig, redirect_uri } from '@/utils/oauthConfig';

export async function GET(request: Request): Promise<Response> {
  // 1) Rate limit
  if (!globalGETRateLimit()) {
    Logger.warn({ namespace: 'login:auth0' }, 'Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  try {
    // 2) Reconstruct the public callback URL
    const currentUrl = new URL(request.url);
    const publicUrl = new URL(Environment.NEXT_PUBLIC_APPLICATION_URL);
    publicUrl.search = currentUrl.search;

    // 3) Grab stored PKCE data
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const storedCodeVerifier = cookieStore.get('oauth_code_verifier')?.value;
    if (!storedState || !storedCodeVerifier) {
      Logger.warn({ namespace: 'login:auth0' }, 'Missing state or code verifier');
      return new Response('Please restart the login process.', { status: 400 });
    }

    // 4) Exchange code for tokens
    Logger.debug({ namespace: 'login:auth0' }, 'Requesting tokens.');
    const auth0config = await openid.discovery(
      new URL(oauthConfig.issuer),
      oauthConfig.clientId,
      oauthConfig.clientSecret
    );
    const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
      auth0config,
      publicUrl,
      {
        pkceCodeVerifier: storedCodeVerifier,
        expectedState: storedState,
      },
      { redirect_uri }
    );

    // 5) Build our session JWT
    const idToken = decodeJwt(tokens.id_token ?? '');
    const jwt = await createSession(
      {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tokens: {
          accessToken: tokens.access_token!,
          accessTokenExpiresAt: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : undefined,
          refreshToken: tokens.refresh_token!,
        },
        user: {
          name: idToken.name as string,
          email: idToken.email as string,
          roles:
            Array.from(
              idToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string[]
            ) ?? [],
        },
      },
      { sessionDurationDays: 7 }
    );

    // 6) Set the session cookie
    const cookieStore2 = await cookies();
    cookieStore2.set('session', jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // 7) Clean up PKCE & returnTo cookies
    const returnTo = cookieStore2.get('returnTo')?.value ?? '/';
    cookieStore2.delete('oauth_state');
    cookieStore2.delete('oauth_code_verifier');
    cookieStore2.delete('returnTo');

    // 8) Redirect back
    return new Response(null, {
      status: 302,
      headers: { Location: returnTo },
    });
  } catch (error) {
    Logger.error({ namespace: 'login:auth0', error }, 'Auth0 callback error');
    return new Response('An unexpected error occurred. Please restart the login process.', {
      status: 500,
    });
  }
}

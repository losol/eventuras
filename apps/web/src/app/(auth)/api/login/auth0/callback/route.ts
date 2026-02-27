import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { createSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { oauthConfig, redirect_uri } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:user:auth', context: { module: 'auth0-callback' } });

export async function GET(request: Request): Promise<Response> {
  // 1) Rate limit
  logger.debug('Checking rate limit');
  if (!(await globalGETRateLimit())) {
    logger.warn('Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  try {
    // 2) Reconstruct the public callback URL
    const currentUrl = new URL(request.url);
    const publicUrl = new URL(appConfig.env.APPLICATION_URL as string);
    publicUrl.search = currentUrl.search;
    logger.debug(
      {
        currentUrl: currentUrl.toString(),
        publicUrl: publicUrl.toString(),
      },
      'callback URL'
    );

    // 3) Grab stored PKCE data
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const storedCodeVerifier = cookieStore.get('oauth_code_verifier')?.value;
    logger.debug(
      {
        hasState: !!storedState,
        hasCodeVerifier: !!storedCodeVerifier,
      },
      'Retrieving PKCE data from cookies'
    );

    if (!storedState || !storedCodeVerifier) {
      logger.warn('Missing state or code verifier');
      return new Response('Please restart the login process.', { status: 400 });
    }

    // 4) Exchange code for tokens
    logger.debug(
      {
        issuer: oauthConfig.issuer,
        clientId: oauthConfig.clientId,
        redirectUri: redirect_uri,
      },
      'Exchanging authorization code for tokens'
    );
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
    logger.debug(
      {
        user: {
          id: idToken.sub,
        },
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
      'Creating session from tokens'
    );

    const jwt = await createSession(
      {
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
    logger.debug('Setting session cookie');
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
    logger.debug({ returnTo }, 'Cleaning up PKCE cookies and redirecting');

    cookieStore2.delete('oauth_state');
    cookieStore2.delete('oauth_code_verifier');
    cookieStore2.delete('returnTo');

    // 8) Redirect back
    const redirectUrl = new URL(returnTo, publicUrl.origin);
    redirectUrl.searchParams.set('login', 'success');

    logger.debug({ redirectUrl: redirectUrl.toString() }, 'Redirecting after successful login');

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  } catch (error) {
    logger.error({ error }, 'Auth0 callback error');
    return new Response('An unexpected error occurred. Please restart the login process.', {
      status: 500,
    });
  }
}

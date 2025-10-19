import {globalGETRateLimit} from '@eventuras/fides-auth-next/request';
import {createSession} from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { appConfig } from '@/config.server';
import { oauthConfig, redirect_uri } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:auth0' });

export async function GET(request: Request): Promise<Response> {
  console.log('[AUTH0 CALLBACK] Starting callback processing');
  logger.info('Starting callback processing');

  // 1) Rate limit
  console.log('[AUTH0 CALLBACK] Checking rate limit');
  if (!globalGETRateLimit()) {
    console.log('[AUTH0 CALLBACK] Rate limit exceeded');
    logger.warn('Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }
  console.log('[AUTH0 CALLBACK] Rate limit OK');

  try {
    // 2) Reconstruct the public callback URL
    const currentUrl = new URL(request.url);
    const publicUrl = new URL(appConfig.env.NEXT_PUBLIC_APPLICATION_URL as string);
    publicUrl.search = currentUrl.search;
    console.log('[AUTH0 CALLBACK] Callback URL:', currentUrl.toString());
    console.log('[AUTH0 CALLBACK] Public URL:', publicUrl.toString());
    logger.debug({
      callbackUrl: currentUrl.toString(),
      publicUrl: publicUrl.toString()
    }, 'Processing callback URLs');

    // 3) Grab stored PKCE data
    console.log('[AUTH0 CALLBACK] Retrieving PKCE data from cookies');
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const storedCodeVerifier = cookieStore.get('oauth_code_verifier')?.value;
    console.log('[AUTH0 CALLBACK] PKCE data:', {
      hasState: !!storedState,
      hasCodeVerifier: !!storedCodeVerifier,
      statePrefix: storedState?.substring(0, 10),
      codeVerifierPrefix: storedCodeVerifier?.substring(0, 10)
    });

    if (!storedState || !storedCodeVerifier) {
      console.log('[AUTH0 CALLBACK] ERROR: Missing state or code verifier');
      logger.warn('Missing state or code verifier');
      return new Response('Please restart the login process.', { status: 400 });
    }
    console.log('[AUTH0 CALLBACK] PKCE data validated');

    console.log('[AUTH0 CALLBACK] PKCE data validated');

    // 4) Exchange code for tokens
    console.log('[AUTH0 CALLBACK] Requesting tokens from Auth0');
    logger.debug('Requesting tokens');
    const auth0config = await openid.discovery(
      new URL(oauthConfig.issuer),
      oauthConfig.clientId,
      oauthConfig.clientSecret
    );
    console.log('[AUTH0 CALLBACK] Auth0 config discovered');

    const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
      auth0config,
      publicUrl,
      {
        pkceCodeVerifier: storedCodeVerifier,
        expectedState: storedState,
      },
      { redirect_uri }
    );
    console.log('[AUTH0 CALLBACK] Tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      hasIdToken: !!tokens.id_token,
      expiresIn: tokens.expires_in
    });
    logger.info({
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    }, 'Tokens received from Auth0');

    // 5) Build our session JWT
    console.log('[AUTH0 CALLBACK] Decoding ID token');
    const idToken = decodeJwt(tokens.id_token ?? '');
    console.log('[AUTH0 CALLBACK] ID token decoded:', {
      name: idToken.name,
      email: idToken.email,
      rolesCount: Array.from(
        idToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string[] ?? []
      ).length
    });
    logger.debug({
      name: idToken.name,
      email: idToken.email
    }, 'ID token decoded');

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
    console.log('[AUTH0 CALLBACK] Session JWT created');
    logger.info('Session JWT created');

    // 6) Set the session cookie
    console.log('[AUTH0 CALLBACK] Setting session cookie');
    const cookieStore2 = await cookies();
    cookieStore2.set('session', jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    console.log('[AUTH0 CALLBACK] Session cookie set');

    // 7) Clean up PKCE & returnTo cookies
    const returnTo = cookieStore2.get('returnTo')?.value ?? '/';
    console.log('[AUTH0 CALLBACK] Cleaning up PKCE cookies, will redirect to:', returnTo);
    logger.info({ returnTo }, 'Cleaning up and redirecting');

    cookieStore2.delete('oauth_state');
    cookieStore2.delete('oauth_code_verifier');
    cookieStore2.delete('returnTo');

    // 8) Redirect back
    console.log('[AUTH0 CALLBACK] Login successful! Redirecting to:', returnTo);
    logger.info({ returnTo }, 'Login successful, redirecting');
    return new Response(null, {
      status: 302,
      headers: { Location: returnTo },
    });
  } catch (error) {
    console.error('[AUTH0 CALLBACK] ERROR during callback:', error);
    logger.error({ error }, 'Auth0 callback error');
    return new Response('An unexpected error occurred. Please restart the login process.', {
      status: 500,
    });
  }
}

import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { createSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { config, oauthConfig, redirect_uri } from '@/utils/config';

const logger = Logger.create({
  namespace: 'idem-admin:auth',
  context: { module: 'callback' },
});

export async function GET(request: Request): Promise<Response> {
  // Rate limit
  if (!(await globalGETRateLimit())) {
    logger.warn('Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  try {
    // Reconstruct the public callback URL
    const currentUrl = new URL(request.url);
    const publicUrl = new URL(config.appUrl);
    publicUrl.pathname = '/api/callback';
    publicUrl.search = currentUrl.search;

    logger.debug(
      {
        currentUrl: currentUrl.toString(),
        publicUrl: publicUrl.toString(),
      },
      'Processing callback'
    );

    // Grab stored PKCE data
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const storedCodeVerifier = cookieStore.get('oauth_code_verifier')?.value;

    if (!storedState || !storedCodeVerifier) {
      logger.warn('Missing state or code verifier');
      return new Response('Please restart the login process.', { status: 400 });
    }

    // Exchange code for tokens
    logger.debug(
      {
        issuer: oauthConfig.issuer,
        clientId: oauthConfig.clientId,
        redirectUri: redirect_uri,
      },
      'Exchanging authorization code for tokens'
    );

    const oidcConfig = await openid.discovery(
      new URL(oauthConfig.issuer),
      oauthConfig.clientId,
      oauthConfig.clientSecret
    );

    const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
      oidcConfig,
      publicUrl,
      {
        pkceCodeVerifier: storedCodeVerifier,
        expectedState: storedState,
      },
      { redirect_uri }
    );

    // Build session from ID token
    const idToken = decodeJwt(tokens.id_token ?? '');
    logger.debug(
      {
        user: {
          id: idToken.sub,
          systemRole: idToken.system_role,
        },
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
      'Creating session from tokens'
    );

    // Extract system_role from idem-idp's claims
    const systemRole = idToken.system_role as string | undefined;

    const jwt = await createSession(
      {
        tokens: {
          accessToken: tokens.access_token!,
          accessTokenExpiresAt: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : undefined,
          refreshToken: tokens.refresh_token,
        },
        user: {
          name: idToken.name as string,
          email: idToken.email as string,
          roles: systemRole ? [systemRole] : [],
        },
        // Store systemRole in data for custom claims
        data: { systemRole },
      },
      { sessionDurationDays: 7 }
    );

    // Set session cookie
    const cookieStore2 = await cookies();
    cookieStore2.set('session', jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Clean up PKCE & returnTo cookies
    const returnTo = cookieStore2.get('returnTo')?.value ?? '/admin';
    logger.debug({ returnTo }, 'Cleaning up cookies and redirecting');

    cookieStore2.delete('oauth_state');
    cookieStore2.delete('oauth_code_verifier');
    cookieStore2.delete('returnTo');

    // Redirect back with login success indicator
    const redirectUrl = new URL(returnTo, currentUrl.origin);
    redirectUrl.searchParams.set('login', 'success');

    logger.info({ redirectUrl: redirectUrl.toString() }, 'Login successful, redirecting');

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  } catch (error) {
    logger.error({ error }, 'OAuth callback error');
    return new Response('An unexpected error occurred. Please restart the login process.', {
      status: 500,
    });
  }
}

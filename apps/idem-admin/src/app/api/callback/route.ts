import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { createSession } from '@eventuras/fides-auth-next/session';
import { Logger } from '@eventuras/logger';

import { config, getOAuthConfig, redirect_uri } from '@/utils/config';

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
      return new Response(errorPage('Session expired', 'Your login session has expired. Please try again.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Exchange code for tokens
    const oauthConfig = getOAuthConfig();
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
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
      'Creating session from tokens'
    );

    // ADR 0018: Extract per-client roles array from idem-idp's claims
    const roles = (idToken.roles as string[]) || [];
    const systemRole = roles[0]; // Primary role for layout compatibility

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
          roles,
        },
        data: { systemRole, roles },
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
    const rawReturnTo = cookieStore2.get('returnTo')?.value;
    // Validate returnTo to prevent open redirect - must be relative path starting with /admin
    const isValidReturnTo =
      typeof rawReturnTo === 'string' &&
      rawReturnTo.startsWith('/admin') &&
      !rawReturnTo.startsWith('//');
    const returnTo = isValidReturnTo ? rawReturnTo : '/admin';
    logger.debug({ returnTo, rawReturnTo }, 'Cleaning up cookies and redirecting');

    cookieStore2.delete('oauth_state');
    cookieStore2.delete('oauth_code_verifier');
    cookieStore2.delete('returnTo');

    // Redirect back with login success indicator (use public appUrl, not internal origin)
    const redirectUrl = new URL(returnTo, config.appUrl);
    redirectUrl.searchParams.set('login', 'success');

    logger.info({ redirectUrl: redirectUrl.toString(), appUrl: config.appUrl, returnTo }, 'Login successful, redirecting');

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  } catch (error) {
    logger.error({ error }, 'OAuth callback error');

    // Clean up OAuth cookies so the user doesn't get stuck in a loop
    const cookieStore = await cookies();
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_code_verifier');
    cookieStore.delete('session');

    return new Response(errorPage('Login failed', 'An unexpected error occurred during login.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function errorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Idem Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #f8fafc;
    }
    p {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    .button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/api/login" class="button">Try Again</a>
  </div>
</body>
</html>`;
}

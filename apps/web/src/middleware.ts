import { NextRequest, NextResponse } from 'next/server';

import {
  accessTokenExpires,
  createSession,
  refreshCurrentSession,
  type Session,
  setSessionCookie,
  validateSessionJwt,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import { oauthConfig } from './utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:middleware' });

/**
 * Validates CORS for non-GET requests.
 * Ensures Origin header matches Host or X-Forwarded-Host.
 */
function validateCorsHeaders(request: NextRequest): NextResponse | null {
  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('Host');
  const forwardedHost = request.headers.get('X-Forwarded-Host');

  if (!originHeader || (!hostHeader && !forwardedHost)) {
    logger.warn(
      {
        hasOrigin: !!originHeader,
        hasHost: !!hostHeader,
        hasForwardedHost: !!forwardedHost,
      },
      'CORS validation failed: missing required headers'
    );
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    logger.warn({ originHeader }, 'Invalid Origin header');
    return new NextResponse(null, { status: 403 });
  }

  if (hostHeader !== origin.host && forwardedHost !== origin.host) {
    logger.warn(
      {
        originHost: origin.host,
        hostHeader,
        forwardedHost,
      },
      'CORS validation failed: origin mismatch'
    );
    return new NextResponse(null, { status: 403 });
  }

  return null;
}

/**
 * Validates the session and returns session status.
 */
async function validateSession(sessionCookie: string) {
  const { status, session } = await validateSessionJwt(sessionCookie);

  logger.debug({ status }, 'Session validation result');

  return { status, session };
}

/**
 * Handles session refresh when access token is expired.
 * Sets a temporary cookie to signal client-side that refresh is happening.
 */
async function handleSessionRefresh(session: Session): Promise<NextResponse | null> {
  if (!session?.tokens?.accessToken) {
    logger.warn('Cannot refresh: no access token in session');
    return null;
  }

  // Check if token is expired
  if (!accessTokenExpires(session.tokens.accessToken)) {
    logger.debug('Access token still valid, no refresh needed');
    return null;
  }

  logger.info('Access token expired, attempting refresh');

  try {
    const updatedSession = await refreshCurrentSession(oauthConfig);

    if (!updatedSession) {
      logger.warn('Session refresh returned null - refresh token likely expired');
      return null;
    }

    // Return response with updated session cookie
    const response = NextResponse.next();
    const encryptedJwt = await createSession(updatedSession);
    await setSessionCookie(encryptedJwt);

    // Clear any refresh-in-progress signal
    response.cookies.delete('auth-refreshing');

    logger.info('Session refreshed successfully');
    return response;
  } catch (error) {
    // Refresh token is invalid or expired - this is expected after long inactivity
    logger.warn({ error }, 'Session refresh failed - refresh token invalid or expired');
    return null;
  }
}

/**
 * Redirects to login page with returnTo parameter.
 */
function redirectToLogin(pathname: string, search: string, originUrl: string): NextResponse {
  const loginUrl = new URL('/api/login/auth0', originUrl);
  loginUrl.searchParams.set('returnTo', pathname + search);

  logger.info({ returnTo: pathname + search }, 'Redirecting to login');

  const response = NextResponse.redirect(loginUrl.toString());
  response.cookies.delete('session');
  return response;
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;
  const originUrl = url.origin;

  logger.debug({ method: request.method, pathname }, 'Middleware processing request');

  // ─── 1) CORS validation for non-GET requests ─────────────────────────────
  if (request.method !== 'GET') {
    const corsError = validateCorsHeaders(request);
    if (corsError) {
      return corsError;
    }

    // After validating headers, continue
    return NextResponse.next();
  }

  // ─── 2) Session validation for protected routes ──────────────────────────
  const sessionCookie = request.cookies.get('session')?.value;

  logger.info({ sessionCookie: !!sessionCookie, pathname }, 'Session cookie status');

  if (!sessionCookie) {
    logger.debug('No session cookie found, redirecting to login');
    return redirectToLogin(pathname, search, originUrl);
  }

  const { status, session } = await validateSession(sessionCookie);

  if (status === 'INVALID') {
    logger.warn('Invalid session detected, redirecting to login');
    return redirectToLogin(pathname, search, originUrl);
  }

  if (status === 'EXPIRED') {
    logger.info('Session expired, attempting refresh');

    // Try to refresh before redirecting
    if (session) {
      const refreshResponse = await handleSessionRefresh(session);
      if (refreshResponse) {
        logger.info('Session refreshed successfully');
        return refreshResponse;
      }
    }

    logger.warn('Session expired and refresh failed, redirecting to login');
    return redirectToLogin(pathname, search, originUrl);
  }

  // ─── 3) Token refresh if needed ───────────────────────────────────────────
  // Even if session JWT is valid, the access token might be expired
  if (session) {
    const refreshResponse = await handleSessionRefresh(session);

    if (refreshResponse) {
      // Token was refreshed successfully
      logger.info('Token refreshed in middleware');
      return refreshResponse;
    }

    // handleSessionRefresh returns null in two cases:
    // 1. Token is still valid (no refresh needed) - this is OK
    // 2. Refresh failed - need to check if token is actually expired

    if (session.tokens?.accessToken && accessTokenExpires(session.tokens.accessToken)) {
      // Access token is expired AND refresh failed
      logger.warn('Access token expired and refresh failed, redirecting to login');
      return redirectToLogin(pathname, search, originUrl);
    }
  }

  // ─── 4) All checks passed ─────────────────────────────────────────────────
  logger.debug('Request authorized, proceeding');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/user/:path*', '/user'],
};

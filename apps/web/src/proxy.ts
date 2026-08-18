import { NextRequest, NextResponse } from 'next/server';

import { getSessionSecret, validateSessionJwt } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'web:proxy' });

/** Every cookie that may hold session state, split format included. */
const SESSION_COOKIE_NAMES = ['session', 'session_at', 'session_it'];

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

/** Redirects to login with returnTo, clearing session cookies; `reason` is logged. */
function redirectToLogin(
  reason: string,
  details: Record<string, unknown>,
  pathname: string,
  search: string,
  originUrl: string
): NextResponse {
  const returnTo = pathname + search;
  const loginUrl = new URL('/api/auth/login', originUrl);
  loginUrl.searchParams.set('returnTo', returnTo);

  logger.warn({ reason, ...details, returnTo }, 'Redirecting to login');

  const response = NextResponse.redirect(loginUrl.toString());
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;
  const originUrl = url.origin;

  logger.debug({ method: request.method, pathname }, 'Proxy processing request');

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
  // Validation only. Middleware cannot persist cookies, so a refresh from here
  // would burn a rotated refresh token; refreshing belongs to the heartbeat.
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return redirectToLogin('no_session_cookie', {}, pathname, search, originUrl);
  }

  const { status, session, accessTokenExpiresIn, reason } = await validateSessionJwt(
    sessionCookie,
    getSessionSecret()
  );

  if (status === 'INVALID') {
    return redirectToLogin(
      'invalid_session_cookie',
      { validationReason: reason },
      pathname,
      search,
      originUrl
    );
  }

  // EXPIRED only fires for stale legacy single-cookie sessions — one re-login.
  if (status === 'EXPIRED') {
    return redirectToLogin(
      'legacy_session_expired',
      {
        expiredSecondsAgo: accessTokenExpiresIn !== undefined ? -accessTokenExpiresIn : undefined,
        hasRefreshToken: !!session?.tokens?.refreshToken,
      },
      pathname,
      search,
      originUrl
    );
  }

  // ─── 3) All checks passed ─────────────────────────────────────────────────
  logger.debug({ pathname, accessTokenExpiresIn }, 'Request authorized, proceeding');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/user/:path*', '/user'],
};

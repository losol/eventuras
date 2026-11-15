import { NextRequest, NextResponse } from 'next/server';

import { Logger } from '@eventuras/logger';

import { auth } from '@/utils/auth/fidesAuth';

const logger = Logger.create({ namespace: 'web:proxy' });

/** Paths that need a session: anonymous visitors are sent to login. */
const PROTECTED_PATHS = ['/admin', '/user'];

const isProtected = (pathname: string) =>
  PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.method !== 'GET') {
    const corsError = validateCorsHeaders(request);
    if (corsError) return corsError;
  }

  if (!request.cookies.has(auth.cookieNames.session)) {
    if (request.method === 'GET' && isProtected(pathname)) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname + search);
      logger.debug({ pathname }, 'No session, redirecting to login');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Refresh here, before rendering: pages can read cookies but not write them.
  // A session that can't be refreshed is left as is; the heartbeat ends it.
  return auth.refreshInProxy(request);
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)',
  ],
};

import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy to handle health checks and system paths
 * 
 * This proxy runs before any page/route handlers and:
 * 1. Allows health check endpoints to pass through
 * 2. Returns 404 for known system/bot paths without logging errors
 * 3. Prevents these requests from reaching locale validation
 * 
 * Note: In Next.js 16+, Middleware is called Proxy to better reflect its purpose.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check and monitoring endpoints - let them through to their route handlers
  const healthCheckPaths = [
    '/api/health',
    '/api/healthz',
    '/api/ready',
  ];

  if (healthCheckPaths.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  // Paths that should return 404 without logging or processing
  // These are typically bots, scanners, or Azure default health checks
  const silentRejectPatterns = [
    /^\/robots\d+\.txt$/, // Azure default health check (e.g., /robots933456.txt)
    /^\/assets(\/|$)/, // Common bot path
    /^\/wp-content(\/|$)/, // WordPress scanner bots
    /^\/wp-admin(\/|$)/, // WordPress scanner bots
    /^\/\.well-known(\/|$)/, // System paths
    /\.php($|\?)/, // PHP file requests (WordPress/scanner bots)
  ];

  if (silentRejectPatterns.some((pattern) => pattern.test(pathname))) {
    // Return 404 without any processing
    return new NextResponse(null, { status: 404 });
  }

  // Allow all other requests to continue
  return NextResponse.next();
}

/**
 * Matcher configuration
 * 
 * Run middleware on all paths except:
 * - Static files (_next/static)
 * - Images (_next/image, favicon, etc.)
 * - Other static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

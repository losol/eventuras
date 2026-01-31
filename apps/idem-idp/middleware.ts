import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'no',

  // Always use a prefix for the locale
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  // Skip API routes, OIDC routes, static files, and health check
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - interaction routes (OIDC interaction API endpoints)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - health endpoint
    // - OIDC endpoints
    '/((?!api|interaction|_next/static|_next/image|favicon.ico|health|auth|token|userinfo|request|\\.well-known).*)',
  ],
};

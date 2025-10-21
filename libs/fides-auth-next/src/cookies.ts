/**
 * Cookie helpers for Next.js authentication flows.
 *
 * IMPORTANT: These functions can ONLY be used in:
 * - Server Actions (functions marked with 'use server')
 * - Route Handlers (files in app/api directory)
 * - Server Components (async React components)
 *
 * They CANNOT be used in:
 * - Client Components (marked with 'use client')
 * - Middleware (use NextResponse.cookies instead)
 * - Edge Runtime without proper configuration
 */

import { Logger } from '@eventuras/logger';
import { cookies } from 'next/headers';

const logger = Logger.create({ namespace: 'fides-auth-next:cookies' });

export interface CookieOptions {
  /** Cookie path (default: '/') */
  path?: string;
  /** Max age in seconds */
  maxAge?: number;
  /** SameSite policy (default: 'lax') */
  sameSite?: 'strict' | 'lax' | 'none';
  /** HTTP only flag (default: true) */
  httpOnly?: boolean;
  /** Secure flag (default: true in production) */
  secure?: boolean;
}

/**
 * Default cookie options for session cookies.
 * - Secure in production
 * - HTTP only
 * - Lax same-site policy
 * - 30 days max age
 */
export const defaultSessionCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: 'lax',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Default cookie options for OAuth state/PKCE cookies.
 * - Secure in production
 * - HTTP only
 * - Lax same-site policy
 * - 10 minutes max age (short-lived for security)
 */
export const defaultOAuthCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 60 * 10, // 10 minutes
  sameSite: 'lax',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Sets a cookie with the given name and value.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (defaults to session cookie options)
 *
 * @example
 * ```ts
 * // In a server action or route handler
 * await setAuthCookie('session', encryptedJwt);
 *
 * // With custom options
 * await setAuthCookie('oauth_state', state, {
 *   maxAge: 60 * 10, // 10 minutes
 * });
 * ```
 */
export async function setAuthCookie(
  name: string,
  value: string,
  options: CookieOptions = defaultSessionCookieOptions
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const cookieOptions = { ...defaultSessionCookieOptions, ...options };

    cookieStore.set(name, value, cookieOptions);

    logger.debug({
      cookieName: name,
      maxAge: cookieOptions.maxAge,
      secure: cookieOptions.secure
    }, 'Cookie set successfully');
  } catch (error) {
    logger.error({ error, cookieName: name }, 'Failed to set cookie');
    throw error;
  }
}

/**
 * Gets a cookie value by name.
 *
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 *
 * @example
 * ```ts
 * // In a server action or route handler
 * const sessionCookie = await getAuthCookie('session');
 * if (sessionCookie) {
 *   // Validate and use session
 * }
 * ```
 */
export async function getAuthCookie(name: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);

    if (!cookie?.value) {
      logger.debug({ cookieName: name }, 'Cookie not found');
      return null;
    }

    logger.debug({ cookieName: name }, 'Cookie retrieved');
    return cookie.value;
  } catch (error) {
    logger.error({ error, cookieName: name }, 'Failed to get cookie');
    return null;
  }
}

/**
 * Deletes a cookie by name.
 *
 * @param name - Cookie name to delete
 *
 * @example
 * ```ts
 * // In a server action or route handler
 * await deleteAuthCookie('session');
 * ```
 */
export async function deleteAuthCookie(name: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(name);

    logger.debug({ cookieName: name }, 'Cookie deleted successfully');
  } catch (error) {
    logger.error({ error, cookieName: name }, 'Failed to delete cookie');
    throw error;
  }
}

/**
 * Deletes multiple cookies at once.
 * Useful for cleaning up OAuth flow cookies.
 *
 * @param names - Array of cookie names to delete
 *
 * @example
 * ```ts
 * // Clean up OAuth cookies after callback
 * await deleteAuthCookies(['oauth_state', 'oauth_code_verifier', 'returnTo']);
 * ```
 */
export async function deleteAuthCookies(names: string[]): Promise<void> {
  try {
    const cookieStore = await cookies();

    for (const name of names) {
      cookieStore.delete(name);
    }

    logger.debug({ cookieNames: names }, 'Multiple cookies deleted successfully');
  } catch (error) {
    logger.error({ error, cookieNames: names }, 'Failed to delete cookies');
    throw error;
  }
}

/**
 * Sets the session cookie with proper security settings.
 * This is a convenience wrapper around setAuthCookie.
 *
 * @param encryptedJwt - The encrypted JWT session token
 * @param options - Optional cookie options (merged with defaults)
 *
 * @example
 * ```ts
 * const jwt = await createSession({ ... });
 * await setSessionCookie(jwt);
 * ```
 */
export async function setSessionCookie(
  encryptedJwt: string,
  options: Partial<CookieOptions> = {}
): Promise<void> {
  await setAuthCookie('session', encryptedJwt, {
    ...defaultSessionCookieOptions,
    ...options,
  });

  logger.info('Session cookie set');
}

/**
 * Gets the current session cookie value.
 * Returns null if no session cookie exists.
 *
 * @returns Encrypted JWT session token or null
 *
 * @example
 * ```ts
 * const sessionToken = await getSessionCookie();
 * if (sessionToken) {
 *   const { status, session } = await validateSessionJwt(sessionToken);
 *   // ...
 * }
 * ```
 */
export async function getSessionCookie(): Promise<string | null> {
  return await getAuthCookie('session');
}

/**
 * Deletes the session cookie.
 * Use this when logging out or when session validation fails.
 *
 * @example
 * ```ts
 * await deleteSessionCookie();
 * redirect('/');
 * ```
 */
export async function deleteSessionCookie(): Promise<void> {
  await deleteAuthCookie('session');
  logger.info('Session cookie deleted');
}

'use server';

import { getCurrentSession } from '@eventuras/fides-auth/session';
import { cookies } from 'next/headers';

import { oauthConfig } from '@/utils/oauthConfig';

/**
 * Returns a access token for the current session.
 *
 * @returns {Promise<string | null>} The access token or null if it cannot be obtained.
 */
export async function getAccessToken(): Promise<string | null> {
  // Retrieve the session cookie.
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  // Get the current session using our helper. This function only reads cookies.
  const session = await getCurrentSession(oauthConfig);

  if (!session || !session.tokens?.accessToken) {
    return null;
  }

  return session.tokens.accessToken;
}

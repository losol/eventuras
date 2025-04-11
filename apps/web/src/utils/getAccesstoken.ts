'use server';

import { getCurrentSession } from '@eventuras/fides-auth/session';
import { cookies } from 'next/headers';

import { oauthConfig } from '@/utils/oauthConfig';

import Environment from './Environment';

/**
 * Returns a valid access token for the current session.
 * If the access token is nearing expiration (less than 300 seconds remaining),
 * this function will trigger a refresh by calling the POST /api/session endpoint.
 *
 * @returns {Promise<string | null>} The access token or null if it cannot be obtained.
 */
export async function getAccessToken(): Promise<string | null> {
  // Retrieve the session cookie.
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  // Get the current session using our helper. This function only reads cookies.
  let session = await getCurrentSession(oauthConfig);
  if (!session || !session.tokens?.accessToken) {
    return null;
  }

  return session.tokens.accessToken;
}

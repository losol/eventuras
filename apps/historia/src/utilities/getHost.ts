import { headers } from 'next/headers';

/**
 * Retrieves the current domain/host from request headers.
 * @returns {Promise<string | null>} The current domain/host, or null if unavailable.
 */
export const getHost = async (): Promise<string | null> => {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  if (!host) {
    console.warn('No host found in request headers.');
    return process.env.NEXT_PUBLIC_SITE_URL ?? null;
  }
  return host;
};

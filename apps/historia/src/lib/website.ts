import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';

import type { Website } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:lib',
  context: { module: 'website' },
});

/**
 * Get the current website/tenant ID from the host header
 *
 * This function determines which website/tenant the current request belongs to
 * by looking up the host header and matching it against configured website domains.
 *
 * @returns The website ID
 * @throws {Error} If no host header is found or no matching website exists
 */
export async function getCurrentWebsiteId(): Promise<string> {
  const website = await getCurrentWebsite();
  return website.id;
}

/**
 * Get the current website data from the host header
 *
 * This function retrieves the full website object for the current request
 * by looking up the host header and matching it against configured website domains.
 *
 * When running behind a reverse proxy (e.g., Azure App Service), this will use
 * the X-Forwarded-Host header if available to get the actual requested domain.
 *
 * Security: This function throws an error if no matching website is found to prevent
 * accidentally serving content from the wrong tenant/website.
 *
 * @returns The website object
 * @throws {Error} If no host header is found or no matching website exists
 */
export async function getCurrentWebsite(): Promise<Website> {
  const payload = await getPayload({ config: configPromise });
  const requestHeaders = await headers();

  // When behind a reverse proxy, X-Forwarded-Host contains the original host
  // Otherwise fall back to the standard Host header
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  if (!host) {
    logger.error('No host header found - cannot determine website/tenant');
    throw new Error('No host header found - cannot determine website/tenant');
  }

  // Find website by domain
  const website = await payload.find({
    collection: 'websites',
    pagination: false,
    limit: 1,
    where: {
      domains: {
        contains: host,
      },
    },
  });

  if (website.docs.length && website.docs[0]) {
    logger.info({ host, websiteId: website.docs[0].id, title: website.docs[0].title }, 'Found website for host');
    return website.docs[0];
  }

  // No match found - fail fast to prevent serving wrong content
  // Build complete request URL using proxy headers for accurate debugging
  const proto = requestHeaders.get('x-forwarded-proto') || 'http';
  const path = requestHeaders.get('x-forwarded-path') || requestHeaders.get('x-original-url') || '/';
  const requestUrl = `${proto}://${host}${path}`;

  logger.error(
    {
      host,
      requestedUrl: requestUrl,
      xForwardedHost: requestHeaders.get('x-forwarded-host'),
      xForwardedProto: requestHeaders.get('x-forwarded-proto'),
      xForwardedPath: requestHeaders.get('x-forwarded-path'),
      xOriginalUrl: requestHeaders.get('x-original-url'),
      hostHeader: requestHeaders.get('host'),
      userAgent: requestHeaders.get('user-agent'),
    },
    'No website configuration found for host'
  );

  throw new Error(`No website configuration found for host: ${host}. Please configure the domain in the website settings.`);
}

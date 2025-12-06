import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:lib',
  context: { module: 'website' },
});

/**
 * Get the current website/tenant ID from the host header
 *
 * This function determines which website/tenant the current request belongs to
 * by looking up the host header and matching it against configured website domains.
 * If no exact match is found, it falls back to the first available website.
 *
 * @returns The website ID if found, null otherwise
 */
export async function getCurrentWebsiteId(): Promise<string | null> {
  const payload = await getPayload({ config: configPromise });
  const host = (await headers()).get('host');

  if (!host) {
    logger.warn('No host header found - cannot determine website/tenant');
    return null;
  }

  // Try to find website by domain
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

  if (website.docs.length && website.docs[0]?.id) {
    logger.info({ host, websiteId: website.docs[0].id }, 'Found website for host');
    return website.docs[0].id;
  }

  // Fallback: Get the first website if no match found
  logger.warn({ host }, 'No website configuration found for host, trying fallback to first website');

  const fallbackWebsite = await payload.find({
    collection: 'websites',
    pagination: false,
    limit: 1,
  });

  if (fallbackWebsite.docs.length && fallbackWebsite.docs[0]?.id) {
    logger.info(
      {
        host,
        websiteId: fallbackWebsite.docs[0].id,
        websiteName: fallbackWebsite.docs[0].name,
        configuredDomains: fallbackWebsite.docs[0].domains
      },
      'Using fallback website (first available)'
    );
    return fallbackWebsite.docs[0].id;
  }

  logger.error({ host }, 'No websites found in database');
  return null;
}

/**
 * Eventuras Public API Client
 *
 * A client for public (anonymous) API endpoints that don't require authentication.
 * Use this client during static generation (generateStaticParams) or for public data.
 *
 * This client does not attempt to inject auth tokens, making it safe to use in
 * contexts where cookies/session are not available (e.g., build time).
 */

import { createClient } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';

const logger = Logger.create({
  namespace: 'web:api-client',
  context: { module: 'eventuras-public-client' },
});

const baseUrl = appConfig.env.NEXT_PUBLIC_BACKEND_URL as string;

if (!baseUrl) {
  throw new Error(
    'NEXT_PUBLIC_BACKEND_URL environment variable is required. Please set it in your .env.local file.'
  );
}

logger.debug({ baseUrl }, 'Creating public API client');

/**
 * Singleton instance of the public client.
 * Configured automatically on module load.
 */
const publicClientInstance = createClient({ baseUrl });

/**
 * Get the public client instance.
 * @returns The configured public client for anonymous API access
 */
export function getPublicClient() {
  return publicClientInstance;
}

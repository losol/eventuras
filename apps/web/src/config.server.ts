/**
 * Server-side Configuration
 *
 * ONLY use this in server components, API routes, and server actions.
 * Do NOT import in client components – all config is server-side only.
 *
 * @example
 * import { appConfig } from '@/config.server';
 * const clientId = appConfig.env.AUTH0_CLIENT_ID;
 */

import { createConfig } from '@eventuras/app-config';

import appConfigJson from '../app.config.json';

/**
 * Server-side configuration with access to all environment variables
 */
export const appConfig = createConfig(appConfigJson);

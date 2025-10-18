/**
 * Client-side configuration
 *
 * Exports publicEnv for use in client components.
 * This module is safe for webpack bundling (no Node.js fs/path).
 */

import { createPublicEnv, type AppConfig } from '@eventuras/app-config/clientside';
import appConfigJson from '../app.config.json';

/**
 * Client-side public environment variables - use publicEnv.NEXT_PUBLIC_*
 * @example
 * const apiUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL;
 * const authDomain = publicEnv.NEXT_PUBLIC_AUTH0_DOMAIN;
 */
export const publicEnv = createPublicEnv(appConfigJson as AppConfig);

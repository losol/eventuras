/**
 * Client-side configuration
 *
 * Exports publicEnv for use in client components.
 * This module is safe for webpack bundling (no Node.js fs/path).
 */

import {
  AppConfig,
  createPublicEnv,
  defineGetter,
  parseIntValue,
} from '@eventuras/app-config/clientside';

import type { WebPublicEnv } from './config.client.generated';
import appConfig from '../app.config.json';

/**
 * Client-side public environment variables - use publicEnv.NEXT_PUBLIC_*
 *
 * Type-safe access to NEXT_PUBLIC_* environment variables.
 * Types are auto-generated from app.config.json.
 *
 * IMPORTANT: Each NEXT_PUBLIC_* variable must have an explicit getter with
 * direct process.env.NEXT_PUBLIC_* access. This is required for Next.js to
 * perform static analysis and replace the values at build time.
 *
 * @example
 * const apiUrl = publicEnv.NEXT_PUBLIC_BACKEND_URL;
 * const authDomain = publicEnv.NEXT_PUBLIC_AUTH0_DOMAIN;
 * const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID; // typed as number
 */
const _publicEnv = createPublicEnv(appConfig as AppConfig);

// Define explicit getters for each NEXT_PUBLIC_* variable
// This allows Next.js to statically analyze and replace at build time
defineGetter(
  _publicEnv,
  'NEXT_PUBLIC_APPLICATION_URL',
  () => process.env.NEXT_PUBLIC_APPLICATION_URL
);
defineGetter(
  _publicEnv,
  'NEXT_PUBLIC_LOGOUT_URL_REDIRECT',
  () => process.env.NEXT_PUBLIC_LOGOUT_URL_REDIRECT
);
defineGetter(
  _publicEnv,
  'NEXT_PUBLIC_DEFAULT_LOCALE',
  () => process.env.NEXT_PUBLIC_DEFAULT_LOCALE
);
defineGetter(_publicEnv, 'NEXT_PUBLIC_AUTH0_DOMAIN', () => process.env.NEXT_PUBLIC_AUTH0_DOMAIN);
defineGetter(_publicEnv, 'NEXT_PUBLIC_ORGANIZATION_ID', () =>
  parseIntValue(process.env.NEXT_PUBLIC_ORGANIZATION_ID)
);
defineGetter(
  _publicEnv,
  'NEXT_PUBLIC_SITE_SETTINGS_URL',
  () => process.env.NEXT_PUBLIC_SITE_SETTINGS_URL
);
defineGetter(_publicEnv, 'NEXT_PUBLIC_BACKEND_URL', () => process.env.NEXT_PUBLIC_BACKEND_URL);

// Export with proper typing
export const publicEnv = _publicEnv as WebPublicEnv;

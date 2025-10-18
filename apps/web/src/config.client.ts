/**
 * Client-side configuration
 *
 * Exports publicEnv for use in client components.
 * This module is safe for webpack bundling (no Node.js fs/path).
 */

import { AppConfig, createPublicEnv } from '@eventuras/app-config/clientside';
import appConfig from '../app.config.json';
import type { WebPublicEnv } from './config.client.generated';

/**
 * Client-side public environment variables - use publicEnv.NEXT_PUBLIC_*
 *
 * Type-safe access to NEXT_PUBLIC_* environment variables.
 * Types are auto-generated from app.config.json.
 *
 * @example
 * const apiUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL;
 * const authDomain = publicEnv.NEXT_PUBLIC_AUTH0_DOMAIN;
 * const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID; // typed as number
 */
export const publicEnv = createPublicEnv(appConfig as AppConfig) as WebPublicEnv;

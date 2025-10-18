/**
 * Application configuration loaded from app.config.json
 *
 * This replaces the old Environment.ts class with a declarative approach.
 * All environment variables are defined in app.config.json at the root of this app.
 *
 * Server-side usage (recommended):
 *   import { appConfig } from '@/config';
 *   const clientId = appConfig.env.AUTH0_CLIENT_ID;
 *   const secret = appConfig.env.SESSION_SECRET;
 *
 * Client-side usage (Next.js):
 *   import { publicEnv } from '@/config';
 *   const apiUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL;
 */

import { createConfig, createEnvironment } from '@eventuras/app-config';
import { resolve } from 'path';

const configPath = resolve(process.cwd(), 'app.config.json');

/**
 * Main app configuration instance
 * Validates all environment variables on first access
 *
 * Use this for server-side code:
 * @example
 * const clientId = appConfig.env.AUTH0_CLIENT_ID;
 * const sessionSecret = appConfig.env.SESSION_SECRET;
 */
export const appConfig = createConfig(configPath);

/**
 * Public environment variables for client-side Next.js components
 *
 * Automatically generates explicit getters for NEXT_PUBLIC_* variables
 * (required for Next.js build-time replacement). Also provides a get()
 * method for server-side variables.
 *
 * @example
 * // Client-side (NEXT_PUBLIC_* only)
 * const apiUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL;
 * const authDomain = publicEnv.NEXT_PUBLIC_AUTH0_DOMAIN;
 *
 * // Server-side (all variables)
 * const clientSecret = publicEnv.get('AUTH0_CLIENT_SECRET');
 * const sessionSecret = publicEnv.get('SESSION_SECRET');
 */
export const publicEnv = createEnvironment(configPath);

/**
 * @deprecated Use `publicEnv` instead for clarity
 */
export const Environment = publicEnv;

/**
 * Legacy EnvironmentVariables enum for backward compatibility
 * @deprecated Use appConfig.get() directly instead
 */
export enum EnvironmentVariables {
  NEXT_PUBLIC_API_BASE_URL = 'NEXT_PUBLIC_API_BASE_URL',
  NEXT_PUBLIC_API_VERSION = 'NEXT_PUBLIC_API_VERSION',
  NEXT_PUBLIC_APPLICATION_URL = 'NEXT_PUBLIC_APPLICATION_URL',
  NEXT_PUBLIC_LOGOUT_URL_REDIRECT = 'NEXT_PUBLIC_LOGOUT_URL_REDIRECT',
  NEXT_PUBLIC_DEFAULT_LOCALE = 'NEXT_PUBLIC_DEFAULT_LOCALE',
  NEXT_PUBLIC_AUTH0_DOMAIN = 'NEXT_PUBLIC_AUTH0_DOMAIN',
  NEXT_PUBLIC_ORGANIZATION_ID = 'NEXT_PUBLIC_ORGANIZATION_ID',
  NEXT_PUBLIC_SITE_SETTINGS_URL = 'NEXT_PUBLIC_SITE_SETTINGS_URL',
  NEXT_PUBLIC_BACKEND_URL = 'NEXT_PUBLIC_BACKEND_URL',
  AUTH0_CLIENT_ID = 'AUTH0_CLIENT_ID',
  AUTH0_CLIENT_SECRET = 'AUTH0_CLIENT_SECRET',
  AUTH0_API_AUDIENCE = 'AUTH0_API_AUDIENCE',
  NODE_ENV = 'NODE_ENV',
  SESSION_SECRET = 'SESSION_SECRET',
}

export default Environment;

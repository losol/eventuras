/**
 * Application configuration loaded from app.config.json
 *
 * This replaces the old Environment.ts class with a declarative approach.
 * All environment variables are defined in app.config.json at the root of this app.
 *
 * Usage:
 *   import { appConfig } from '@/config';
 *   const apiUrl = appConfig.get<string>('NEXT_PUBLIC_API_BASE_URL');
 *   const orgId = appConfig.get<string>('NEXT_PUBLIC_ORGANIZATION_ID');
 */

import { createConfig, type ConfigLoader } from '@eventuras/app-config';
import { resolve } from 'path';

let configInstance: ConfigLoader | null = null;

/**
 * Get or create the singleton config instance
 */
export function getAppConfig(): ConfigLoader {
  if (!configInstance) {
    const configPath = resolve(process.cwd(), 'app.config.json');
    configInstance = createConfig(configPath);
  }
  return configInstance;
}

/**
 * Main app configuration instance
 * Validates all environment variables on first access
 */
export const appConfig = getAppConfig();

/**
 * Type-safe environment variable accessors
 *
 * These provide the same API as the old Environment class
 * but with automatic validation and type conversion.
 */
export const Environment = {
  /**
   * Validate environment (happens automatically on first access)
   */
  validate: () => {
    getAppConfig();
  },

  /**
   * Get a server-side environment variable
   */
  get: <T = string>(varName: string): T => {
    return appConfig.get<T>(varName);
  },

  // Client-side accessible variables (NEXT_PUBLIC_*)
  get NEXT_PUBLIC_BACKEND_URL() {
    return appConfig.get<string>('NEXT_PUBLIC_BACKEND_URL');
  },

  get NEXT_PUBLIC_API_BASE_URL() {
    return appConfig.get<string>('NEXT_PUBLIC_API_BASE_URL');
  },

  get NEXT_PUBLIC_API_VERSION() {
    return appConfig.get<string>('NEXT_PUBLIC_API_VERSION');
  },

  get NEXT_PUBLIC_APPLICATION_URL() {
    return appConfig.get<string>('NEXT_PUBLIC_APPLICATION_URL');
  },

  get NEXT_PUBLIC_DEFAULT_LOCALE() {
    return appConfig.get<string>('NEXT_PUBLIC_DEFAULT_LOCALE');
  },

  get NEXT_PUBLIC_LOGOUT_URL_REDIRECT() {
    return appConfig.get<string>('NEXT_PUBLIC_LOGOUT_URL_REDIRECT');
  },

  get NEXT_PUBLIC_AUTH0_DOMAIN() {
    return appConfig.get<string>('NEXT_PUBLIC_AUTH0_DOMAIN');
  },

  get NEXT_PUBLIC_ORGANIZATION_ID() {
    return appConfig.get<string>('NEXT_PUBLIC_ORGANIZATION_ID');
  },

  get NEXT_PUBLIC_SITE_SETTINGS_URL() {
    return appConfig.get<string>('NEXT_PUBLIC_SITE_SETTINGS_URL');
  },
} as const;

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

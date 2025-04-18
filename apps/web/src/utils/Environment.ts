import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';

/**
 * Environment Class to handle and validate environment variables.
 *
 * - Checks the existence of all these variables, throwing an error if any are missing.
 * - Exception: Any variable in OptionalEnvironmentVariables is considered optional and will not throw an error if missing.
 * - Default values for variables can be provided in the `defaults` object.
 *
 * Note: Due to Next.js limitations, public environment variables (those prefixed with NEXT_PUBLIC)
 * must be accessed explicitly and cannot be accessed dynamically.
 */

// Default values
const defaults = {
  NEXT_PUBLIC_ORGANIZATION_ID: '1',
};

// All Environment Variables
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

// Optional Environment Variables
export const OptionalEnvironmentVariables = [EnvironmentVariables.NEXT_PUBLIC_SITE_SETTINGS_URL];

// Environment Class
class Environment {
  // Validate Required and Optional Environment Variables
  // Needs to run server-side
  static validate() {
    for (const key of Object.keys(EnvironmentVariables)) {
      const isSet = () => Object.prototype.hasOwnProperty.call(process.env, key);
      const isOptional = OptionalEnvironmentVariables.includes(
        EnvironmentVariables[key as keyof typeof EnvironmentVariables]
      );

      // Set default values if available and not set
      if (Object.prototype.hasOwnProperty.call(defaults, key) && !isSet()) {
        process.env[key] = (defaults as any)[key];
      }

      if (!isSet() && !isOptional) {
        throw new Error(`${key} is not set, please make sure to define all environment variables`);
      }

      const environmentValue = process.env[key];
      if (environmentValue?.length === 0 && !isOptional) {
        throw new Error(
          `${key} is set, but contains no value. Please make sure to define all environment variables`
        );
      }
    }
  }

  // Getter for environment variables
  static get(identifier: keyof Record<EnvironmentVariables, string>): string {
    if (identifier.includes('NEXT_PUBLIC')) {
      throw new Error(
        `Any NEXT_PUBLIC variables need to be accessed directly! Use Environment.${identifier} instead`
      );
    }
    return process.env[identifier]!;
  }

  static get NEXT_IN_PHASE_PRODUCTION_BUILD() {
    return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  }

  // Explicit getters for NEXT_PUBLIC variables
  static get NEXT_PUBLIC_BACKEND_URL() {
    return process.env.NEXT_PUBLIC_BACKEND_URL!;
  }

  static get NEXT_PUBLIC_API_BASE_URL() {
    return process.env.NEXT_PUBLIC_API_BASE_URL!;
  }

  static get NEXT_PUBLIC_API_VERSION() {
    return process.env.NEXT_PUBLIC_API_VERSION!;
  }

  static get NEXT_PUBLIC_APPLICATION_URL() {
    return process.env.NEXT_PUBLIC_APPLICATION_URL!;
  }

  static get NEXT_PUBLIC_DEFAULT_LOCALE() {
    return process.env.NEXT_PUBLIC_DEFAULT_LOCALE!;
  }

  static get NEXT_PUBLIC_LOGOUT_URL_REDIRECT() {
    return process.env.NEXT_PUBLIC_LOGOUT_URL_REDIRECT!;
  }

  static get NEXT_PUBLIC_AUTH0_DOMAIN() {
    return process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
  }

  static get NEXT_PUBLIC_ORGANIZATION_ID() {
    return process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? defaults.NEXT_PUBLIC_ORGANIZATION_ID;
  }
  static get NEXT_PUBLIC_SITE_SETTINGS_URL() {
    return process.env.NEXT_PUBLIC_SITE_SETTINGS_URL!;
  }
}

export default Environment;

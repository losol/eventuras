/* eslint-disable no-process-env */

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

// Required Environment Variables
export enum RequiredEnvironmentVariables {
  NEXT_PUBLIC_API_BASE_URL = 'NEXT_PUBLIC_API_BASE_URL',
  NEXT_PUBLIC_API_VERSION = 'NEXT_PUBLIC_API_VERSION',
  NEXT_PUBLIC_LOGOUT_URL_REDIRECT = 'NEXT_PUBLIC_LOGOUT_URL_REDIRECT',
  NEXT_PUBLIC_AUTH0_DOMAIN = 'NEXT_PUBLIC_AUTH0_DOMAIN',
  NEXT_PUBLIC_ORGANIZATION_ID = 'NEXT_PUBLIC_ORGANIZATION_ID',
  API_BASE_URL = 'API_BASE_URL',
  AUTH0_CLIENT_ID = 'AUTH0_CLIENT_ID',
  AUTH0_CLIENT_SECRET = 'AUTH0_CLIENT_SECRET',
  AUTH0_API_AUDIENCE = 'AUTH0_API_AUDIENCE',
  NEXTAUTH_URL = 'NEXTAUTH_URL',
  NEXTAUTH_SECRET = 'NEXTAUTH_SECRET',
  NODE_ENV = 'NODE_ENV',
}

// Optional Environment Variables
export enum OptionalEnvironmentVariables {
  FEATURE_SENTRY_DSN = 'FEATURE_SENTRY_DSN',
  SENTRY_AUTH_TOKEN = 'SENTRY_AUTH_TOKEN',
}

// Environment Class
class Environment {
  // Validate Required and Optional Environment Variables
  // Needs to run server-side
  static validate() {
    for (const key of [
      ...Object.keys(RequiredEnvironmentVariables),
      ...Object.keys(OptionalEnvironmentVariables),
    ]) {
      const isSet = () => process.env.hasOwnProperty(key);
      const isOptional = Object.keys(OptionalEnvironmentVariables).includes(key);

      // Set default values if available and not set
      if (defaults.hasOwnProperty(key) && !isSet()) {
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
  static get(
    identifier:
      | keyof typeof RequiredEnvironmentVariables
      | keyof typeof OptionalEnvironmentVariables
  ): string {
    if (identifier.includes('NEXT_PUBLIC')) {
      throw new Error(
        `Any NEXT_PUBLIC variables need to be accessed directly! Use Environment.${identifier} instead`
      );
    }
    return process.env[identifier]!;
  }

  // Explicit getters for NEXT_PUBLIC variables
  static get NEXT_PUBLIC_API_BASE_URL() {
    return process.env.NEXT_PUBLIC_API_BASE_URL!;
  }

  static get NEXT_PUBLIC_API_VERSION() {
    return process.env.NEXT_PUBLIC_API_VERSION!;
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
}

export default Environment;

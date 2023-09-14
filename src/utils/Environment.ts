/* eslint-disable no-process-env */

/**
 * Unfortunately, the way nextjs bakes in public environment variables, pub env vars need to be accessed explicitly,
 * they cannot be referenced dynamically like server side environment variables(those without NEXT_PUBLIC)
 */

export enum EnvironmentVariables {
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

//all defaults should be a string as well!
const defaults = {
  NEXT_PUBLIC_ORGANIZATION_ID: '1',
};

class Environment {
  //validates environment variales in EnvironmentVariables are present - make sure not to run this client-side, as only public env
  //vars are available there
  static validate() {
    for (const key of Object.keys(EnvironmentVariables)) {
      const isSet = () => process.env.hasOwnProperty(key);
      if (defaults.hasOwnProperty(key) && !isSet()) {
        process.env[key] = (defaults as any)[key];
      }
      if (!isSet()) {
        throw new Error(`${key} is not set, please make sure to define all environment variables`);
      }

      const environmentValue = process.env[key];
      if (environmentValue?.length === 0) {
        throw new Error(
          `${key} is set, but contains no value please make sure to define all environment variables`
        );
      }
    }
  }

  static get(identifier: keyof Record<EnvironmentVariables, string>): string {
    if (identifier.includes('NEXT_PUBLIC')) {
      throw new Error(
        `Any NEXT_PUBLIC variables need to be accessed directly! Use Environment.${identifier} instead`
      );
    }
    return process.env[identifier]!;
  }

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

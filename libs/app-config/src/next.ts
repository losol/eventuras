import { AppConfig } from './types.js';
import { ConfigLoader } from './loader.js';

/**
 * Create explicit getters for NEXT_PUBLIC_* environment variables.
 *
 * This is required for Next.js because it performs build-time replacement of
 * process.env.NEXT_PUBLIC_* variables. We must access process.env directly,
 * not through a runtime lookup.
 *
 * @param config - The app configuration
 * @returns An object with explicit getters for each NEXT_PUBLIC_* variable
 */
export function createPublicEnvGetters(config: AppConfig) {
  const getters: Record<string, unknown> = {};

  for (const [varName, definition] of Object.entries(config.env)) {
    if (definition.client && varName.startsWith('NEXT_PUBLIC_')) {
      Object.defineProperty(getters, varName, {
        get() {
          return process.env[varName];
        },
        enumerable: true,
      });
    }
  }

  return getters;
}

export interface EnvironmentObject {
  validate: () => void;
  get: <T = string>(varName: string) => T;
  [key: string]: unknown;
}

/**
 * Create a complete Environment object with validation and explicit getters.
 *
 * This provides a drop-in replacement for the old Environment class pattern,
 * with automatic validation and proper Next.js NEXT_PUBLIC_* support.
 *
 * @param configPath - Path to app.config.json
 * @returns An object with validate(), get(), and explicit NEXT_PUBLIC_* getters
 */
export function createEnvironment(configPath: string): EnvironmentObject {
  let configInstance: ConfigLoader | null = null;

  function getConfigInstance(): ConfigLoader {
    if (!configInstance) {
      configInstance = new ConfigLoader(configPath);
    }
    return configInstance;
  }

  const publicGetters = createPublicEnvGetters(getConfigInstance().getConfig());

  return {
    /**
     * Validate environment (happens automatically on first access)
     */
    validate: () => {
      getConfigInstance();
    },

    /**
     * Get a server-side environment variable
     */
    get: <T = string>(varName: string): T => {
      return getConfigInstance().get(varName) as T;
    },

    // Spread in all the NEXT_PUBLIC_* getters
    ...publicGetters,
  };
}

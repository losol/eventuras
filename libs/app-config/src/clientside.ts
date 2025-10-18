import { AppConfig } from './types.js';

// Re-export types for client usage
export type { AppConfig } from './types.js';

/**
 * Create explicit getters for NEXT_PUBLIC_* environment variables (client-side only).
 *
 * This is for use in client components and doesn't require fs access.
 * It directly accesses process.env which Next.js replaces at build time.
 *
 * @param config - The app configuration object (plain object, not ConfigLoader)
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

export interface PublicEnvObject {
  [key: string]: unknown;
}

/**
 * Create a public environment object with explicit NEXT_PUBLIC_* getters.
 *
 * This is the client-safe version that doesn't use fs or ConfigLoader.
 * Use this in apps/web/src/config.ts for the publicEnv export.
 *
 * @param config - Plain app configuration object
 * @returns An object with explicit NEXT_PUBLIC_* getters
 */
export function createPublicEnv(config: AppConfig): PublicEnvObject {
  return createPublicEnvGetters(config);
}

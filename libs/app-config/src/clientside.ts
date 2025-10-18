import { AppConfig } from './types.js';

// Re-export types for client usage
export type { AppConfig } from './types.js';

/**
 * Map environment variable type string to TypeScript type
 */
type EnvVarTypeMap = {
  string: string;
  url: string;
  int: number;
  bool: boolean;
  json: unknown;
};

/**
 * Infer the TypeScript type from an environment variable definition with literal type support
 */
type InferEnvVarType<T> =
  T extends { type: infer Type; required: infer Req }
    ? Type extends keyof EnvVarTypeMap
      ? Req extends true
        ? EnvVarTypeMap[Type]
        : EnvVarTypeMap[Type] | undefined
      : unknown
    : unknown;

/**
 * Extract public environment variable types from AppConfig
 */
export type PublicEnvObject<T> = T extends { env: infer Env }
  ? {
      [K in keyof Env as Env[K] extends { client: true } ? K : never]: InferEnvVarType<Env[K]>;
    }
  : never;

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
          const value = process.env[varName];

          // Type coercion based on definition
          if (value === undefined) return undefined;

          switch (definition.type) {
            case 'int':
              return parseInt(value, 10);
            case 'bool':
              return value === 'true' || value === '1';
            case 'json':
              try {
                return JSON.parse(value);
              } catch {
                return value;
              }
            default:
              return value;
          }
        },
        enumerable: true,
      });
    }
  }

  return getters;
}

/**
 * Create a public environment object with explicit NEXT_PUBLIC_* getters.
 *
 * This is the client-safe version that doesn't use fs or ConfigLoader.
 * Use this in apps/web/src/config.ts for the publicEnv export.
 *
 * @param config - Plain app configuration object
 * @returns An object with explicit NEXT_PUBLIC_* getters with properly inferred types
 */
export function createPublicEnv<const T extends AppConfig>(config: T): PublicEnvObject<T> {
  return createPublicEnvGetters(config) as PublicEnvObject<T>;
}

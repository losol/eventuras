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
 * Helper to parse integer value
 */
export function parseIntValue(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  return parseInt(value, 10);
}

/**
 * Helper to parse boolean value
 */
export function parseBoolValue(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true' || value === '1';
}

/**
 * Helper to parse JSON value
 */
export function parseJsonValue(value: string | undefined): unknown {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Helper to define a getter property on an object.
 *
 * This is useful for creating explicit getters that Next.js can statically analyze.
 * Instead of dynamic property access like process.env[varName], you should use
 * direct property access like process.env.NEXT_PUBLIC_MY_VAR in the getter function.
 *
 * @param target - The target object to add the getter to
 * @param propName - The property name
 * @param getter - The getter function that returns the value
 *
 * @example
 * ```ts
 * const env = {};
 * defineGetter(env, 'NEXT_PUBLIC_API_URL', () => process.env.NEXT_PUBLIC_API_URL);
 * defineGetter(env, 'NEXT_PUBLIC_ORG_ID', () => parseIntValue(process.env.NEXT_PUBLIC_ORG_ID));
 * ```
 */
export function defineGetter<T>(
  target: Record<string, unknown>,
  propName: string,
  getter: () => T
): void {
  Object.defineProperty(target, propName, {
    get: getter,
    enumerable: true,
  });
}

/**
 * Create an empty object for public environment variables.
 *
 * Use this with defineGetter to create explicit getters for NEXT_PUBLIC_* variables.
 * This approach allows Next.js to perform static analysis and replace environment
 * variables at build time.
 *
 * @returns An empty object to add getters to
 *
 * @example
 * ```ts
 * const publicEnv = createPublicEnvGetters();
 * defineGetter(publicEnv, 'NEXT_PUBLIC_API_URL', () => process.env.NEXT_PUBLIC_API_URL);
 * defineGetter(publicEnv, 'NEXT_PUBLIC_ORG_ID', () => parseIntValue(process.env.NEXT_PUBLIC_ORG_ID));
 * ```
 */
export function createPublicEnvGetters(): Record<string, unknown> {
  return {};
}

/**
 * Create a public environment object with the correct TypeScript type.
 *
 * This is a type-safe wrapper that returns an empty object you can add getters to.
 * Use this with defineGetter to create explicit NEXT_PUBLIC_* getters.
 *
 * @param _config - Plain app configuration object (used only for type inference)
 * @returns An empty object with the correct TypeScript type for your config
 *
 * @example
 * ```ts
 * import appConfig from '../app.config.json';
 *
 * export const publicEnv = createPublicEnv(appConfig as AppConfig);
 * defineGetter(publicEnv, 'NEXT_PUBLIC_API_URL', () => process.env.NEXT_PUBLIC_API_URL);
 * defineGetter(publicEnv, 'NEXT_PUBLIC_ORG_ID', () => parseIntValue(process.env.NEXT_PUBLIC_ORG_ID));
 * ```
 */
export function createPublicEnv<const T extends AppConfig>(_config: T): PublicEnvObject<T> {
  return createPublicEnvGetters() as PublicEnvObject<T>;
}

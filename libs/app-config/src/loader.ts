import { AppConfig, appConfigSchema } from './types.js';
import { parseEnvValue, EnvValidationError } from './validator.js';

/**
 * Configuration loader class
 */
export class ConfigLoader {
  private config: AppConfig;
  private envValues: Record<string, unknown> = {};

  /**
   * Direct access to environment variables as properties
   * @example config.env.AUTH0_CLIENT_ID
   */
  public readonly env: Record<string, unknown>;

  constructor(
    configObject: unknown,
    private processEnv: NodeJS.ProcessEnv = process.env
  ) {
    // Validate schema
    const result = appConfigSchema.safeParse(configObject);
    if (!result.success) {
      throw new Error(
        `Invalid app.config.json:\n${result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`
      );
    }

    this.config = result.data;

    // Skip validation during Next.js build/compilation phases
    // During these phases, we still want to read the env vars, but not fail the build if they're missing
    // NEXT_PHASE is set by Next.js during build
    const isNextBuild =
      this.processEnv.NEXT_PHASE === 'phase-production-build' ||
      this.processEnv.NEXT_PHASE === 'phase-development-server';

    // Always try to validate/read environment variables
    // During build, we'll be lenient about missing required vars
    this.validateEnvironment(!isNextBuild);

    // Create readonly proxy for env access
    this.env = new Proxy(this.envValues, {
      get: (target, prop: string) => {
        if (!(prop in target)) {
          throw new Error(
            `Environment variable "${prop}" is not defined in app.config.json.\n` +
            `Available variables: ${Object.keys(target).join(', ')}`
          );
        }
        return target[prop];
      },
      set: () => {
        throw new Error('Cannot modify environment variables through config.env');
      },
    });
  }

  /**
   * Validate all environment variables according to config
   * @param strictRequired - Whether to throw errors for missing required vars (false during build)
   */
  private validateEnvironment(strictRequired = true): void {
    const errors: EnvValidationError[] = [];

    for (const [varName, definition] of Object.entries(this.config.env)) {
      try {
        const value = parseEnvValue(varName, this.processEnv[varName], definition);
        this.envValues[varName] = value;

        // Set default values back to process.env if they were missing
        if (this.processEnv[varName] === undefined && value !== undefined) {
          this.processEnv[varName] = String(value);
        }
      } catch (error) {
        if (error instanceof EnvValidationError) {
          // During build (strictRequired=false), skip required validation errors but still collect type errors
          if (!strictRequired && error.message.includes('Required environment variable')) {
            // Use default value or empty string if required var is missing during build
            this.envValues[varName] = definition.default ?? '';
            continue;
          }
          errors.push(error);
        } else {
          throw error;
        }
      }
    }

    // Throw all errors at once
    if (errors.length > 0) {
      const errorMessage = errors.map(e => `\n❌ ${e.message}`).join('\n');
      throw new Error(`Environment validation failed:${errorMessage}\n`);
    }
  }

  /**
   * Get a typed environment variable value
   */
  get<T = unknown>(varName: string): T {
    if (!(varName in this.envValues)) {
      throw new Error(
        `Environment variable "${varName}" is not defined in app.config.json.\n` +
        `Available variables: ${Object.keys(this.envValues).join(', ')}`
      );
    }
    return this.envValues[varName] as T;
  }

  /**
   * Get the raw app configuration
   */
  getConfig(): Readonly<AppConfig> {
    return this.config;
  }

  /**
   * Get all environment variables as a typed object
   */
  getAllEnv(): Readonly<Record<string, unknown>> {
    return { ...this.envValues };
  }

  /**
   * Check if a variable exists
   */
  has(varName: string): boolean {
    return varName in this.envValues;
  }
}

/**
 * Create a config loader from a config object
 */
export function createConfig(configObject: unknown): ConfigLoader {
  return new ConfigLoader(configObject);
}

/**
 * Validate app configuration and environment variables.
 * This is useful for running validation explicitly during app initialization.
 *
 * @param configObject - App configuration object (parsed from app.config.json)
 * @throws Error if configuration is invalid or required env vars are missing
 *
 * @example
 * ```typescript
 * // In your app initialization (e.g., layout.tsx or main.ts)
 * import { validate } from '@eventuras/app-config';
 * import appConfigJson from './app.config.json';
 *
 * validate(appConfigJson);
 * console.log('✓ Environment validated successfully');
 * ```
 */
export function validate(configObject: unknown): void {
  // Simply creating the config will trigger validation
  // If validation fails, an error will be thrown
  new ConfigLoader(configObject);
}

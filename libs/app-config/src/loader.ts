import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppConfig, appConfigSchema } from './types.js';
import { parseEnvValue, EnvValidationError } from './validator.js';

/**
 * Configuration loader class
 */
export class ConfigLoader {
  private config: AppConfig;
  private env: Record<string, unknown> = {};

  constructor(
    configPath: string,
    private processEnv: NodeJS.ProcessEnv = process.env
  ) {
    // Load and parse config file
    const configFile = readFileSync(resolve(configPath), 'utf-8');
    const rawConfig = JSON.parse(configFile);

    // Validate schema
    const result = appConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      throw new Error(
        `Invalid app.config.json:\n${result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`
      );
    }

    this.config = result.data;

    // Validate and parse all environment variables
    this.validateEnvironment();
  }

  /**
   * Validate all environment variables according to config
   */
  private validateEnvironment(): void {
    const errors: EnvValidationError[] = [];

    for (const [varName, definition] of Object.entries(this.config.env)) {
      try {
        const value = parseEnvValue(varName, this.processEnv[varName], definition);
        this.env[varName] = value;

        // Set default values back to process.env if they were missing
        if (this.processEnv[varName] === undefined && value !== undefined) {
          this.processEnv[varName] = String(value);
        }
      } catch (error) {
        if (error instanceof EnvValidationError) {
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
    if (!(varName in this.env)) {
      throw new Error(
        `Environment variable "${varName}" is not defined in app.config.json.\n` +
          `Available variables: ${Object.keys(this.env).join(', ')}`
      );
    }
    return this.env[varName] as T;
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
    return { ...this.env };
  }

  /**
   * Check if a variable exists
   */
  has(varName: string): boolean {
    return varName in this.env;
  }
}

/**
 * Create a config loader from a config file path
 */
export function createConfig(configPath: string): ConfigLoader {
  return new ConfigLoader(configPath);
}

/**
 * Validate app configuration and environment variables.
 * This is useful for running validation explicitly during app initialization.
 *
 * @param configPath - Path to app.config.json
 * @throws Error if configuration is invalid or required env vars are missing
 *
 * @example
 * ```typescript
 * // In your app initialization (e.g., layout.tsx or main.ts)
 * import { validate } from '@eventuras/app-config';
 *
 * validate('./app.config.json');
 * console.log('✓ Environment validated successfully');
 * ```
 */
export function validate(configPath: string): void {
  // Simply creating the config will trigger validation
  // If validation fails, an error will be thrown
  new ConfigLoader(configPath);
}

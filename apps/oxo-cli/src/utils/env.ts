/**
 * Environment utilities for oxo CLI
 * Handles .env file loading and validation
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load .env file from project root
 * This is needed because oclif doesn't load .env files automatically
 *
 * @param projectRoot - Path to project root (defaults to 2 levels up from CLI root)
 */
export function loadEnvFile(projectRoot?: string): void {
  const rootPath = projectRoot || resolve(__dirname, '../../..');
  const envPath = join(rootPath, '.env');

  if (!existsSync(envPath)) {
    return; // .env file is optional
  }

  try {
    const envFile = readFileSync(envPath, 'utf8');

    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, Math.max(0, equalsIndex)).trim();
      let value = trimmed.slice(Math.max(0, equalsIndex + 1)).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Don't override existing environment variables
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    // Silently fail - .env loading is optional
    console.warn(`Warning: Failed to load .env file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate required environment variables
 *
 * @param required - Array of required variable names
 * @returns Array of missing variable names (empty if all present)
 */
export function validateEnvVars(required: string[]): string[] {
  return required.filter((key) => !process.env[key]);
}

/**
 * Check if required environment variables are set
 *
 * @param required - Array of required variable names
 * @returns true if all variables are present
 */
export function hasEnvVars(required: string[]): boolean {
  return validateEnvVars(required).length === 0;
}

/**
 * Get environment variable or exit with error
 *
 * @param key - Environment variable name
 * @param errorMessage - Custom error message (optional)
 * @returns Environment variable value
 */
export function requireEnvVar(key: string, errorMessage?: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      errorMessage || `${key} environment variable is required. Set it in your .env file or as an environment variable.`
    );
  }

  return value;
}

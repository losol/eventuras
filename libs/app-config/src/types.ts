import { z } from 'zod';

/**
 * Supported environment variable types
 */
export type EnvVarType = 'string' | 'url' | 'int' | 'bool' | 'json';

/**
 * Environment variable definition
 */
export interface EnvVarDefinition {
  /** Whether this variable is required */
  required: boolean;
  /** Whether this variable is exposed to the client (e.g., NEXT_PUBLIC_*) */
  client: boolean;
  /** Expected type of the variable */
  type: EnvVarType;
  /** Human-readable description */
  description: string;
  /** Default value if not provided */
  default?: string | number | boolean | object;
  /** Regular expression pattern for validation */
  pattern?: string;
  /** Allowed values */
  enum?: string[];
}

/**
 * Application configuration schema
 */
export interface AppConfig {
  /** JSON Schema reference */
  $schema?: string;
  /** Application package name */
  name: string;
  /** Configuration type */
  type: 'app';
  /** Application description */
  description?: string;
  /** Environment variable definitions */
  env: Record<string, EnvVarDefinition>;
  /** Build configuration */
  build?: {
    outDir?: string;
    target?: string;
  };
  /** Runtime configuration */
  runtime?: {
    port?: number;
  };
}

/**
 * Zod schema for environment variable definition
 */
export const envVarDefinitionSchema = z.object({
  required: z.boolean(),
  client: z.boolean(),
  type: z.enum(['string', 'url', 'int', 'bool', 'json']),
  description: z.string(),
  default: z.union([z.string(), z.number(), z.boolean(), z.object({})]).optional(),
  pattern: z.string().optional(),
  enum: z.array(z.string()).optional(),
});

/**
 * Zod schema for app configuration
 */
export const appConfigSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  type: z.literal('app'),
  description: z.string().optional(),
  env: z.record(z.string(), envVarDefinitionSchema),
  build: z
    .object({
      outDir: z.string().optional(),
      target: z.string().optional(),
    })
    .optional(),
  runtime: z
    .object({
      port: z.number().optional(),
    })
    .optional(),
});

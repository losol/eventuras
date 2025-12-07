/**
 * Generate TypeScript types from app.config.json
 * This module provides functions to generate type definitions from configuration files
 */

import fs from 'fs/promises';
import path from 'path';

type EnvVarType = 'string' | 'url' | 'int' | 'bool' | 'json';

interface EnvVarDef {
  required: boolean;
  client: boolean;
  type: EnvVarType;
  description: string;
}

interface AppConfig {
  env: Record<string, EnvVarDef>;
}

function mapTypeToTS(type: EnvVarType): string {
  const map: Record<EnvVarType, string> = {
    string: 'string',
    url: 'string',
    int: 'number',
    bool: 'boolean',
    json: 'unknown',
  };
  return map[type];
}

export interface GenerateTypesOptions {
  /** Path to app.config.json file */
  configPath: string;
  /** Path where the generated .d.ts file should be written */
  outputPath: string;
  /** Name of the interface to generate (default: 'PublicEnv') */
  interfaceName?: string;
}

/**
 * Generate TypeScript type definitions from an app.config.json file
 * @param options - Configuration options for type generation
 */
export async function generateTypes(options: GenerateTypesOptions): Promise<void> {
  const { configPath, outputPath, interfaceName = 'PublicEnv' } = options;

  console.log('📝 Reading config from:', configPath);

  const configContent = await fs.readFile(configPath, 'utf-8');
  const config: AppConfig = JSON.parse(configContent);

  const publicVars = Object.entries(config.env)
    .filter(([, def]) => def.client)
    .map(([name, def]) => {
      const tsType = mapTypeToTS(def.type);
      const optional = def.required ? '' : '?';
      return `  ${name}${optional}: ${tsType};`;
    });

  const output = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from app.config.json
 *
 * To regenerate, run: pnpm generate:config-types
 */

export interface ${interfaceName} {
${publicVars.join('\n')}
}
`;

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  await fs.writeFile(outputPath, output, 'utf-8');
  console.log('✅ Generated types at:', outputPath);
}

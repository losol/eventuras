#!/usr/bin/env tsx
/**
 * Generate TypeScript types from app.config.json
 * This script reads the configuration and generates type definitions
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '..', 'app.config.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'config.client.generated.d.ts');

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

async function generateTypes() {
  console.log('📝 Reading config from:', CONFIG_PATH);

  const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
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

export interface WebPublicEnv {
${publicVars.join('\n')}
}
`;

  await fs.writeFile(OUTPUT_PATH, output, 'utf-8');
  console.log('✅ Generated types at:', OUTPUT_PATH);
}

generateTypes().catch((error) => {
  console.error('❌ Failed to generate types:', error);
  process.exit(1);
});

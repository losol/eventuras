#!/usr/bin/env tsx
/**
 * Generate TypeScript types from app.config.json for Historia
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateTypes } from '@eventuras/app-config/generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '..', 'app.config.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'config.client.generated.d.ts');

generateTypes({
  configPath: CONFIG_PATH,
  outputPath: OUTPUT_PATH,
  interfaceName: 'HistoriaPublicEnv',
}).catch((error: unknown) => {
  console.error('❌ Failed to generate types:', error);
  process.exit(1);
});

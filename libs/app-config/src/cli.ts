#!/usr/bin/env node
/**
 * CLI tool to generate TypeScript types from app.config.json
 * Usage: node cli.js <configPath> <outputPath> [interfaceName]
 */

import { generateTypes } from './generator.js';

async function main() {
  const [, , configPath, outputPath, interfaceName] = process.argv;

  if (!configPath || !outputPath) {
    console.error('Usage: generate-config-types <configPath> <outputPath> [interfaceName]');
    console.error('Example: generate-config-types ./app.config.json ./src/config.generated.d.ts PublicEnv');
    process.exit(1);
  }

  try {
    await generateTypes({
      configPath,
      outputPath,
      interfaceName,
    });
  } catch (error) {
    console.error('❌ Failed to generate types:', error);
    process.exit(1);
  }
}

main();

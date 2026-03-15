import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { collect } from '@eventuras/docs-framework/collect';

const cwd = process.cwd();
const configPath = resolve(cwd, 'docs.config.ts');
const configModule = await import(pathToFileURL(configPath).href);
const config = configModule.default;

// Walk up to find repo root (pnpm-workspace.yaml or .git)
let rootDir = cwd;
while (rootDir !== '/') {
  const { existsSync } = await import('node:fs');
  if (existsSync(resolve(rootDir, 'pnpm-workspace.yaml'))) break;
  rootDir = dirname(rootDir);
}

console.log(`Collecting from ${config.sources.length} sources...`);
await collect({ rootDir, config, configDir: cwd });

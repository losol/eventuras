import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { collect } from './collect.js';
import type { DocsConfig } from './config.js';

const CONFIG_FILENAMES = ['docs.config.ts', 'docs.config.js', 'docs.config.mjs'];

export interface RunCollectOptions {
  /** Directory to resolve the config from (default: process.cwd()) */
  cwd?: string;
  /** Explicit path to the config file, overriding auto-discovery */
  config?: string;
  /** Explicit repo root, overriding auto-detection */
  root?: string;
}

/**
 * Load a docs config, resolve the repo root, and run {@link collect}.
 *
 * Discovers `docs.config.{ts,js,mjs}` in `cwd` and walks up to the repo root
 * (nearest `pnpm-workspace.yaml` or `.git`) so a consumer script is a one-liner:
 *
 * ```ts
 * import { runCollect } from '@eventuras/docs-framework';
 * await runCollect();
 * ```
 */
export async function runCollect(opts: RunCollectOptions = {}): Promise<void> {
  const cwd = opts.cwd ? resolve(opts.cwd) : process.cwd();

  const configPath = opts.config ? resolve(cwd, opts.config) : findConfig(cwd);
  if (!configPath) {
    throw new Error(`No docs config found. Create one of: ${CONFIG_FILENAMES.join(', ')}`);
  }

  const configModule = await import(pathToFileURL(configPath).href);
  const config = configModule.default as DocsConfig | undefined;

  if (!config?.sources || !config?.output) {
    throw new Error('Config must export { output, sources } (use defineDocsConfig helper)');
  }

  const rootDir = opts.root ? resolve(cwd, opts.root) : findRepoRoot(cwd);

  console.log(`Collecting from ${config.sources.length} sources...`);
  await collect({ rootDir, config, configDir: dirname(configPath) });
}

function findConfig(startDir: string): string | null {
  for (const name of CONFIG_FILENAMES) {
    const candidate = resolve(startDir, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  const root = resolve('/');

  while (dir !== root) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml')) || existsSync(resolve(dir, '.git'))) {
      return dir;
    }
    dir = dirname(dir);
  }

  return startDir;
}

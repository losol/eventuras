import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { Command, Flags } from '@oclif/core';

import { collect } from '../../collect.js';

const CONFIG_FILENAMES = ['docs.config.ts', 'docs.config.js', 'docs.config.mjs'];

export default class DocsCollect extends Command {
  static override description = 'Collect documentation from across the repo into a single output directory';

  static override examples = [
    '$ oxo docs collect',
    '$ oxo docs collect --config ./custom.config.ts',
    '$ oxo docs collect --root /path/to/repo',
  ];

  static override flags = {
    config: Flags.string({
      char: 'c',
      description: 'Path to docs config file',
    }),
    root: Flags.string({
      char: 'r',
      description: 'Repository root directory (auto-detected if not set)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DocsCollect);

    const cwd = process.cwd();
    const configPath = flags.config
      ? resolve(cwd, flags.config)
      : this.findConfig(cwd);

    if (!configPath) {
      this.error(`No docs config found. Create one of: ${CONFIG_FILENAMES.join(', ')}`);
    }

    this.log(`Using config: ${configPath}`);

    const configModule = await import(pathToFileURL(configPath).href);
    const config = configModule.default;

    if (!config?.sources || !config?.output) {
      this.error('Config must export { output, sources } (use defineDocsConfig helper)');
    }

    const rootDir = flags.root ? resolve(cwd, flags.root) : this.findRepoRoot(cwd);
    this.log(`Repo root: ${rootDir}`);
    this.log(`Collecting from ${config.sources.length} sources...\n`);

    await collect({
      rootDir,
      config,
      configDir: dirname(configPath),
    });
  }

  private findConfig(startDir: string): string | null {
    for (const name of CONFIG_FILENAMES) {
      const candidate = resolve(startDir, name);
      if (existsSync(candidate)) return candidate;
    }

    return null;
  }

  private findRepoRoot(startDir: string): string {
    let dir = startDir;
    const root = resolve('/');

    while (dir !== root) {
      if (
        existsSync(resolve(dir, 'pnpm-workspace.yaml')) ||
        existsSync(resolve(dir, '.git'))
      ) {
        return dir;
      }

      dir = dirname(dir);
    }

    return startDir;
  }
}

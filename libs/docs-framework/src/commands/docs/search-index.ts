import { relative, resolve } from 'node:path';

import { Command, Flags } from '@oclif/core';
import { buildSearchIndex } from '@eventuras/lustro-search/build-index';

export default class DocsSearchIndex extends Command {
  static override description = 'Build an Orama search index from the documentation site';

  static override examples = [
    '$ oxo docs search-index',
    '$ oxo docs search-index --site .next/server/app --output public/search-index.json',
  ];

  static override flags = {
    output: Flags.string({
      char: 'o',
      default: 'public/search-index.json',
      description: 'Path to write the search index JSON',
    }),
    site: Flags.string({
      char: 's',
      default: '.next/server/app',
      description: 'Directory of built HTML to index',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DocsSearchIndex);
    const cwd = process.cwd();

    const site = resolve(cwd, flags.site);
    const output = resolve(cwd, flags.output);

    this.log(`Indexing HTML in ${relative(cwd, site)}...`);

    await buildSearchIndex({
      siteDir: site,
      outputPath: output,
      log: (msg: string) => this.log(msg),
    });
  }
}

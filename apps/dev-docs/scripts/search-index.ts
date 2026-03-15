import { resolve } from 'node:path';

import { buildSearchIndex } from '@eventuras/lustro-search/build-index';

const cwd = process.cwd();
const site = resolve(cwd, '.next/server/app');
const output = resolve(cwd, 'public/search-index.json');

console.log('Building search index...');
await buildSearchIndex({
  siteDir: site,
  outputPath: output,
  log: (msg: string) => console.log(msg),
});

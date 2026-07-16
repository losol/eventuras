'use client';

import { Search } from '@eventuras/docs-framework/react';
import { OramaProvider } from '@eventuras/docs-framework/search';

const provider = new OramaProvider('/search-index.json');

export function SearchButton() {
  return <Search provider={provider} placeholder="Search docs..." />;
}

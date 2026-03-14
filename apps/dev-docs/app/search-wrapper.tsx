'use client';

import { OramaProvider } from '@eventuras/lustro-search';
import { Search } from '@eventuras/lustro-search/react';

const provider = new OramaProvider('/search-index.json');

export function SearchButton() {
  return <Search provider={provider} placeholder="Search docs..." />;
}

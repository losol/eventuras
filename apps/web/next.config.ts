import path from 'path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',

  turbopack: {
    // Explicitly set monorepo root to avoid Next.js picking up a stray lockfile
    // from a parent directory (e.g. ~/package-lock.json) which breaks workspace
    // package resolution.
    root: path.resolve(__dirname, '../..'),
  },

  transpilePackages: [
    '@eventuras/scribo',
    '@eventuras/smartform',
    '@eventuras/fides-auth-next',
    '@eventuras/markdown',
    '@xstate/store',
  ],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

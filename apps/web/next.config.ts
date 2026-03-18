import { readFileSync } from 'fs';
import path from 'path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

const nextConfig: NextConfig = {
  output: 'standalone',

  env: {
    BUILD_GIT_SHA: process.env.GIT_SHA ?? 'unknown',
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: pkg.version ?? 'unknown',
  },

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

  allowedDevOrigins: process.env.APPLICATION_URL
    ? [new URL(process.env.APPLICATION_URL).hostname]
    : [],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

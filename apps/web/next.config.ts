import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@eventuras/sdk',
    '@eventuras/scribo',
    '@eventuras/ratio-ui',
    '@eventuras/fides-auth',
    '@eventuras/smartform',
    '@eventuras/datatable',
    '@eventuras/logger',
    '@eventuras/toast',
    '@eventuras/markdowninput',
    '@eventuras/event-sdk',
  ],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  // Exclude pino from Next.js bundling - load as external packages
  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'pino-abstract-transport',
  ],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore worker_threads and other node-specific modules in server bundles
      config.externals = config.externals || [];
      config.externals.push({
        'worker_threads': 'commonjs worker_threads',
        'pino-pretty': 'commonjs pino-pretty',
        'pino-abstract-transport': 'commonjs pino-abstract-transport',
      });
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

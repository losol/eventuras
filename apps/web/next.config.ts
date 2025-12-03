import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
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

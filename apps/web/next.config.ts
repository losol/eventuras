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

  // Disable Next.js built-in ESLint (we use standalone ESLint)
  eslint: {
    // Ignore ESLint during production builds (run separately in CI)
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

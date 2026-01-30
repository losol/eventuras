import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // IMPORTANT: Do NOT use output: 'standalone' - conflicts with custom server
  reactStrictMode: true,

  // Transpile ratio-ui for server-side rendering
  transpilePackages: ['@eventuras/ratio-ui'],

  // Experimental features
  experimental: {
    // Required for custom server with App Router
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Allow workspace packages outside the app directory
    externalDir: true,
  },
};

export default withNextIntl(nextConfig);

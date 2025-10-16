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
    '@eventuras/utils',
    '@eventuras/toast',
    '@eventuras/markdowninput',
    '@eventuras/event-sdk',
  ],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eventuras/sdk', '@eventuras/scribo'],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

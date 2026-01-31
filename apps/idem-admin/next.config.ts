import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@eventuras/fides-auth-next', '@xstate/store'],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;

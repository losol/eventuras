import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  transpilePackages: ['@eventuras/fides-auth-next', '@xstate/store', '@xstate/store-react'],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eventuras/scribo', '@eventuras/markdowninput', '@eventuras/smartform'],

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

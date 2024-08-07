/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-var-requires */
const nextTranslate = require('next-translate-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eventuras/sdk', '@eventuras/scribo'],

  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  i18n: {
    // Disable automatic locale detection and redirect
    localeDetection: false,
  },
};

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  });
  module.exports = withBundleAnalyzer(nextTranslate(nextConfig));
  return;
}

module.exports = nextTranslate(nextConfig);

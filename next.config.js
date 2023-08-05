/* eslint-disable @typescript-eslint/no-var-requires */
const nextTranslate = require('next-translate-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@losol/eventuras'],

  images: {
    unoptimized: true,
  },

  i18n: {
    // Disable automatic locale detection and redirect
    localeDetection: false,
  },
};

module.exports = nextTranslate(nextConfig);

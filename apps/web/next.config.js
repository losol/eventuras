/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-var-requires */
const { composePlugins, withNx } = require('@nx/next');
const nextTranslate = require('next-translate-plugin');

// Base Next.js configuration
const baseNextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@losol/eventuras'],

  images: {
    unoptimized: true,
  },

  i18n: {
    localeDetection: false,
  },
};

// Nx configuration
const nxConfig = {
  nx: {
    svgr: false,
  },
};

// Plugins array
const plugins = [withNx(nxConfig), nextTranslate];

// Conditional plugin for bundle analyzer
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  });
  plugins.push(withBundleAnalyzer);
}

// Compose the plugins with the base configuration
module.exports = composePlugins(...plugins)(baseNextConfig);

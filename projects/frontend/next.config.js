/* eslint-disable no-process-env */
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

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  });
  module.exports = withBundleAnalyzer(nextTranslate(nextConfig));
  return;
}

// Sentry config
if (process.env.FEATURE_SENTRY === 'true') {
  const { withSentryConfig } = require('@sentry/nextjs');

  const nextConfigWithSentry = {
    ...nextConfig,
    sentry: {
      dsn: process.env.SENTRY_DSN,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      hideSourceMaps: true,
    },
  };

  const sentryWebpackPluginOptions = {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    authToken: process.env.SENTRY_AUTH_TOKEN,

    silent: true,
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  };

  module.exports = withSentryConfig(
    nextTranslate(nextConfigWithSentry),
    sentryWebpackPluginOptions
  );
  return;
}

// no sentry
module.exports = nextTranslate(nextConfig);

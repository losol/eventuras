import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

import redirects from './redirects.js'
import { allowedOrigins, getAllowedDomainsFromAllowedOrigins } from './src/config/allowed-origins.ts'

const cmsUrlCandidates = [
  // Prefer explicit configuration (custom domain) when present
  process.env.NEXT_PUBLIC_CMS_URL,

  // Vercel-provided production URL can differ from the custom domain.
  // Allowlisting both avoids Next Image rejecting valid media URLs.
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,

  // Local development default
  'http://localhost:3100',
].filter(Boolean)

const allowedImageDomains = getAllowedDomainsFromAllowedOrigins(allowedOrigins) || []

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      ...allowedImageDomains.map((hostname) => ({
        protocol: 'https',
        hostname,
      })),
      ...allowedImageDomains.map((hostname) => ({
        protocol: 'http',
        hostname,
      })),
      // Always allow the CMS URL(s)
      ...cmsUrlCandidates.map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
}

// Compose the configurations: Sentry wraps Payload
export default withSentryConfig(withPayload(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.CMS_SENTRY_ORG,
  project: process.env.CMS_SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})

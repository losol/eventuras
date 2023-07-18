// const nextTranslate = require('next-translate');
const nextTranslate = require('next-translate-plugin');

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Internationalization(i18n) Routing
  // https://nextjs.org/docs/pages/building-your-application/routing/internationalization#sub-path-routing
  // i18n: {
  //   locales: ['en-US', 'nb-NO'],
  //   defaultLocale: defaultLocale ? defaultLocale : 'en-US',
  // },
};

module.exports = nextTranslate({
  webpack: (nextConfig, { isServer, webpack }) => {
    return nextConfig;
  }
})

const nextTranslate = require('next-translate-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // i18n: {
  //   locales: ['en-US', 'nb-NO'],
  //   defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  // },
};

module.exports = nextTranslate(nextConfig);

/* eslint-disable no-process-env */

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
const { resolve } = require('path');

const i18config = {
  locales: ['nb-NO', 'en-US'],
  defaultLocale: defaultLocale ? defaultLocale : 'en-US',
  pages: {
    '*': ['common'],
    'rgx:/user(.*?)': ['user'],
    'rgx:/admin(.*?)': ['admin'],
  },
  localePath: resolve('./apps/web/public/locales'),
};

module.exports = i18config;

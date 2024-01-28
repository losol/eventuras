/* eslint-disable no-process-env */

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

const i18config = {
  locales: ['nb-NO', 'en-US'],
  defaultLocale: defaultLocale ? defaultLocale : 'en-US',
  pages: {
    '*': ['common'],
    'rgx:/user(.*?)': ['user'],
    'rgx:/admin(.*?)': ['admin'],
  },
};

module.exports = i18config;

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

const i18config = {
  locales: ['nb', 'en'],
  defaultLocale: defaultLocale ? defaultLocale : 'en',
  pages: {
    '*': ['common'],
    '/': ['index'],
  },
};

module.exports = i18config;

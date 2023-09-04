const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

const i18config = {
  locales: ['nb-NO', 'en-US'],
  defaultLocale: defaultLocale ? defaultLocale : 'en-US',
  pages: {
    '*': ['common'],
    '/': ['index'],
    'rgx:(.*?)events/(.*?)/registration': ['register'],
    'rgx:/admin(.*?)': ['admin'],
  },
};

module.exports = i18config;

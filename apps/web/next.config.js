/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-var-requires */
const nextTranslate = require('next-translate-plugin');
const { withNx } = require('@nx/next');

const nextConfig = {
  images: {
    unoptimized: true,
  },

  i18n: {
    localeDetection: false,
  },
};

module.exports = withNx(nextTranslate(nextConfig));

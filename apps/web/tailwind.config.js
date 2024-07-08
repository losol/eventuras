/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

module.exports = {
  darkMode: 'media',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/datatable/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/forms/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['source-sans-pro', 'sans-serif'],
      serif: ['source-serif-pro', 'serif'],
      mono: ['ui-monospace', 'Courier New', 'monospace'],
      display: ['source-sans-pro', 'sans-serif'],
      body: ['source-sans-pro', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: colors.sky,
        secondary: colors.rose,
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [require('tailwindcss-react-aria-components'), require('tailwindcss-animate')],
};

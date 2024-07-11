/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    fontFamily: {
      sans: ['"source-sans-pro"', 'sans-serif'],
      serif: ['"source-serif-pro"', 'serif'],
      mono: ['ui-monospace', 'Courier New', 'monospace'],
      display: ['"source-sans-pro"', 'sans-serif'],
      body: ['"source-sans-pro"', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#406280',
          50: '#f5f7fa',
          100: '#eaeff4',
          200: '#d0dce7',
          300: '#a7bed2',
          400: '#779db9',
          500: '#5680a1',
          600: '#406280',
          700: '#37536d',
          800: '#31475b',
          900: '#2c3d4e',
          950: '#1d2834',
        },
        secondary: {
          DEFAULT: 'd63759',
          50: '#fef2f3',
          100: '#fde6e8',
          200: '#fad1d6',
          300: '#f7aab4',
          400: '#f17b8b',
          500: '#e74c66',
          600: '#d63759',
          700: '#b21e41',
          800: '#951c3d',
          900: '#801b39',
          950: '#470a1b',
        },
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
  plugins: [],
};

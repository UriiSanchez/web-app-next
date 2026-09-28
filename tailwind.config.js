/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/helpers/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
          900: '#222222',
          light: '#383838',
          500: '#A8A29E',
        },
        gray: {
          DEFAULT: '#C8C8C8',
          light: '#E3E3E3',
        },
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00A88D',
          light: '#00C4A7',
          dark: '#008f7a',
        },
        accent: {
          DEFAULT: '#C0E218',
          dark: '#a8c314',
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        },
      },
      boxShadow: {
        'brand': '0 10px 15px -3px rgba(0, 168, 141, 0.2)',
        'brand-lg': '0 20px 25px -5px rgba(0, 168, 141, 0.3)',
      },
    },
  },
  plugins: [],
};

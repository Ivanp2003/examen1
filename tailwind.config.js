const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './app/(tabs)/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#F4A261',
        secondary: '#E76F51',
        accent: '#E9C46A',
        background: '#FFF7ED',
        surface: '#FFFFFF',
        error: '#EF4444',
        success: '#10B981',
        text: '#6D597A',
        'text-secondary': '#84A98C',
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        purple: {
          900: '#6D597A',
        },
        emerald: {
          100: '#D1FAE5',
          500: '#10B981',
          800: '#065F46',
        },
        rose: {
          100: '#FFE4E6',
          500: '#F43F5E',
          800: '#9F1239',
        },
        amber: {
          100: '#FEF3C7',
          800: '#92400E',
        },
      },
    },
  },
  plugins: [],
};

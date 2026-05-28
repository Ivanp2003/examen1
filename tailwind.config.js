const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        accent: '#F59E0B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        error: '#EF4444',
        success: '#10B981',
        text: '#1E293B',
        'text-secondary': '#64748B',
      },
    },
  },
  plugins: [],
};

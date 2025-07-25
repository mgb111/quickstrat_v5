/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#fafbfc',      // lightest gray
          100: '#f4f5f7',     // very light gray
          200: '#e5e7eb',     // light gray
          300: '#d1d5db',     // gray
          400: '#9ca3af',     // medium gray
          500: '#6b7280',     // dark gray
          600: '#4b5563',     // darker gray
          700: '#374151',     // even darker gray
          800: '#1f2937',     // near-black
          900: '#111827',     // almost black
        }
      }
    },
  },
  plugins: [],
};

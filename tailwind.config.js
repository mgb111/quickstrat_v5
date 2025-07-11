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
          50: '#f7f9fc',
          100: '#e3f2fd',
          200: '#dbe2ef',
          300: '#c5cae9',
          400: '#7986cb',
          500: '#5c6bc0',
          600: '#3f51b5',
          700: '#304ffe',
          800: '#2962ff',
          900: '#1a237e',
        }
      }
    },
  },
  plugins: [],
};

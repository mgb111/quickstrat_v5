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
          50: '#f8f5ff',      // lightest purple
          100: '#f3e8ff',     // lavender
          200: '#e0c3fc',     // light purple
          300: '#b388ff',     // purple
          400: '#ff80bf',     // pink
          500: '#80d8ff',     // cyan
          600: '#7c4dff',     // deep purple
          700: '#00bcd4',     // teal/cyan
          800: '#ff4081',     // hot pink
          900: '#12005e',     // deep indigo
        }
      }
    },
  },
  plugins: [],
};

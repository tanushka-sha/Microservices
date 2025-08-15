/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode removed
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        modalOverlay: 'rgba(0,0,0,0.55)'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.2)'
      },
      backdropBlur: {
        xs: '2px'
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};



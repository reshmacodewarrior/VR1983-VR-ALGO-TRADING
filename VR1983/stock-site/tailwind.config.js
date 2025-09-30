/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      backgroundImage: {
        'gradient-light-blue': 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
        'gradient-light-header': 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
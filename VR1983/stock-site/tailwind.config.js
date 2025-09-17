/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust to match your project structure
  ],
  theme: {
    extend: { fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },},
  },
  darkMode: 'class', // 👈 add this
  plugins: [],
}

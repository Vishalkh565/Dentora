/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dentalDark: '#0B1121', // Dark navy/gunmetal
        dentalTeal: '#0D9488', // Teal accent
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

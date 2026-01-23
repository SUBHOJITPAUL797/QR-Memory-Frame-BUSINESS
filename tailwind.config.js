/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js", "./components/**/*.js"],
  theme: {
    extend: {
      colors: {
        gold: {
          500: '#C5A059',
          600: '#B08D55',
        },
        warm: {
          50: '#FDFBF7',
          900: '#2C241B',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

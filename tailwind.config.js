/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#d4af37',
          500: 'var(--gold-500, #C5A059)',
          600: 'var(--gold-600, #B08D55)'
        },
        slate: {
          50: '#f8fafc',
          900: '#0f172a'
        },
        warm: {
          50: '#fdfcfb',
          100: '#fcfbf9',
          900: '#1c1917'
        },
        hero: {
          DEFAULT: 'var(--hero-color, #ffffff)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        script: ['Great Vibes', 'cursive'],
        cinzel: ['Cinzel', 'serif'],
        pacifico: ['Pacifico', 'cursive'],
        'dancing-script': ['Dancing Script', 'cursive'],
        'sacramento': ['Sacramento', 'cursive'],
        'parisienne': ['Parisienne', 'cursive'],
        'allura': ['Allura', 'cursive'],
        'pinyon-script': ['Pinyon Script', 'cursive'],
        'mr-de-haviland': ['Mr De Haviland', 'cursive'],
        'alex-brush': ['Alex Brush', 'cursive'],
        'tangerine': ['Tangerine', 'cursive'],
        'cormorant': ['Cormorant Garamond', 'serif'],
        'merriweather': ['Merriweather', 'serif'],
        'eb-garamond': ['EB Garamond', 'serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'raleway': ['Raleway', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

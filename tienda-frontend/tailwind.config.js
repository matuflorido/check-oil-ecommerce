/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1A1A1A',
        'dark-secondary': '#2D2D2D',
        'dark-text': '#E5E5E5',
        'dark-text-muted': '#A0A0A0',
        'check-orange': '#F78E1E',
        'check-orange-dark': '#E67E0C',
        'check-orange-light': '#FFA030'
      },
      backgroundColor: {
        'dark': '#1A1A1A',
        'dark-card': '#2D2D2D'
      },
      textColor: {
        'dark': '#E5E5E5',
        'dark-muted': '#A0A0A0'
      },
      borderColor: {
        'dark': '#3A3A3A'
      }
    }
  },
  darkMode: 'class',
  plugins: []
}

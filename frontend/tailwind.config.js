/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mexico-green': '#006847',
        'mexico-red': '#CE1126',
        'mexico-gold': '#FCD116',
        'beach-blue': '#00A8E8',
        'sand': '#F4E4C1',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

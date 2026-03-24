/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#050505',
        'cyber-gray': '#1a1a1a',
        'cyber-red': '#ff0000',
        'cyber-red-dim': '#4d0000',
        'cyber-neon': '#ff3333',
      },
      boxShadow: {
        'neon-red': '0 0 10px #ff0000, 0 0 20px #4d0000',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
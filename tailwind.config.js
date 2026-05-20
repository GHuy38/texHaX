/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        card: '#101010',
        border: '#1e1e1e',
        red: { DEFAULT: '#cc0000', hover: '#ee0000', dark: '#990000' },
        muted: '#444444',
        subtle: '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  },
  plugins: []
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#0f172a',
          900: '#111827', // Main background
          800: '#182235', // Content panels
          700: '#1D293B', // Secondary panels
          600: '#2A374A', // Borders
          green: '#10b981',
          red: '#ef4444',
          cyan: '#06b6d4',
          amber: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}

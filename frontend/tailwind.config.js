/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mediczen: {
          blue: "#2563eb",
          lightBlue: "#eff6ff",
          bg: "#f4f6fa",
          card: "#ffffff",
          text: "#1e293b",
          subtext: "#64748b",
          border: "#e2e8f0"
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

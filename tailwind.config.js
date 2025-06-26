/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#4BADE6', // Blue
        primaryBlack: '#111111', // Green
        secondaryBlack: '#333333', // Black
        primarGray: '#666666', // Gray
        secondaryGray: '#6E6E6E', // Light Gray
        dark: '#464255', // Dark
      },
    },
  },
  plugins: [],
}



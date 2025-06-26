/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        OutfitBold: ['OutfitBold', 'sans-serif'],
        InterTight: ['Inter', 'sans-serif'],
        Inter: ['Inter', 'sans-serif'],
        Objective: ['Objective', 'sans-serif'],
        proxima: ['Proxima Nova', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        PoppinsSemiBold: ['PoppinsSemiBold', 'sans-serif'],
        ManropeSemiBold: ['ManropeSemiBold', 'sans-serif'],
        monrope: ['Manrope', 'sans-serif'],
        Roboto: ['Roboto', 'sans-serif'],
        PlusJakarta: ['Plus Jakarta', 'sans-serif'],
        SFProDisplay: ['SFProDisplay', 'sans-serif'],
        DMSansRegular: ['DMSans-Regular', 'sans-serif'],
        OutfitBold: ['OutfitBold', 'sans-serif'],
        PublicSansMedium : ['PublicSansMedium', 'sans-serif'],
        Urbanist: ['Urbanist', 'sans-serif'],
      },
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



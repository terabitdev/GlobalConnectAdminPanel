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
        OutfitSemiBold: ['OutfitSemiBold', 'sans-serif'],
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
        PlusJakartaSans: ['PlusJakartaSans', 'sans-serif'],
        SFProDisplay: ['SFProDisplay', 'sans-serif'],
        DMSansRegular: ['DMSans-Regular', 'sans-serif'],
        OutfitBold: ['OutfitBold', 'sans-serif'],
        PublicSansMedium : ['PublicSansMedium', 'sans-serif'],
        Urbanist: ['Urbanist', 'sans-serif'],
        BarlowMedium: ['BarlowMedium', 'sans-serif'],
      },
      colors: {
        primaryBlue: '#4BADE6', // Blue
        primaryBlack: '#111111', // Green
        secondaryBlack: '#333333', // Black
        primarGray: '#666666', // Gray
        secondaryGray: '#6E6E6E', // Light Gray
        grayModern: '#9AA4B2', // Modern Gray
        dark: '#464255', // Dark
      },
      boxShadow: {
        'custom': '2px 2px 10px 0px #00000040',
      },
    },
  },
  plugins: [
     function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none", // Firefox
          "-ms-overflow-style": "none", // IE/Edge
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none", // Chrome, Safari
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin", // Firefox
          "-ms-overflow-style": "auto", // IE/Edge
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "8px", // Chrome, Safari
          height: "8px",
        },
                      
      });
    },
  ],
}



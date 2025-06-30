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
        WorkSansRegular: ['WorkSansRegular', 'sans-serif'],
        WorkSansMedium: ['WorkSansMedium', 'sans-serif'],
      },
      colors: {
        primaryBlue: '#4BADE6', // Blue
        primaryBlack: '#111111', // Green
        secondaryBlack: '#333333', // Black
        thirdBlack: '#0D121C', // Dark Black
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
        // Hide default date picker icons
        '.date-input::-webkit-calendar-picker-indicator': {
          'opacity': '0',
          'position': 'absolute',
          'right': '0',
          'width': '100%',
          'height': '100%',
          'cursor': 'pointer',
        },
        '.date-input::-webkit-datetime-edit-fields-wrapper': {
          'padding': '0',
        },
        '.date-input::-webkit-datetime-edit-text': {
          'color': 'transparent',
          'background': 'transparent',
        },
        '.date-input::-webkit-datetime-edit-month-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        '.date-input::-webkit-datetime-edit-day-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        '.date-input::-webkit-datetime-edit-year-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        
        // Hide default time picker icons
        '.time-input::-webkit-calendar-picker-indicator': {
          'opacity': '0',
          'position': 'absolute',
          'right': '0',
          'width': '100%',
          'height': '100%',
          'cursor': 'pointer',
        },
        '.time-input::-webkit-datetime-edit-fields-wrapper': {
          'padding': '0',
        },
        '.time-input::-webkit-datetime-edit-text': {
          'color': 'transparent',
          'background': 'transparent',
        },
        '.time-input::-webkit-datetime-edit-hour-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        '.time-input::-webkit-datetime-edit-minute-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        '.time-input::-webkit-datetime-edit-ampm-field': {
          'color': '#374151',
          'background': 'transparent',
        },
        
        // Color scheme
        '.date-input, .time-input': {
          'color-scheme': 'light',
          '-webkit-appearance': 'none',
          '-moz-appearance': 'textfield',
        },
                      
      });
    },
  ],
}



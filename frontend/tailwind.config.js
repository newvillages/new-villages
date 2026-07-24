/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4ED8', // Royal Blue
          hover: '#1E40AF',   // Deep Royal
          dark: '#0A2540',    // Midnight Blue
        },
        midnight: {
          DEFAULT: '#0A2540',
          dark: '#07192C',
        },
        royal: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
        },
        sky: {
          DEFAULT: '#38BDF8',
          light: '#E0F2FE',
        },
        heading: '#102A43',
        bodytext: '#486581',
        bordercolor: '#E2E8F0',
        background: {
          light: '#F8FAFC',
          dark: '#0A2540',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

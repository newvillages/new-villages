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
          DEFAULT: '#E86225', // Warm Orange
          hover: '#D0521B',   // Deep Orange
          dark: '#1E4D2B',    // Forest Green
          light: '#FDF0E9',   // Soft Orange Tint
        },
        brandOrange: {
          DEFAULT: '#E86225',
          hover: '#D0521B',
          light: '#FDF0E9',
        },
        brandGreen: {
          DEFAULT: '#1E4D2B',
          hover: '#163E22',
          light: '#E8F3EB',
          dark: '#133820',
        },
        brandBrown: {
          DEFAULT: '#4A2C11',
          hover: '#3A1F0D',
          light: '#FAF5EF',
        },
        midnight: {
          DEFAULT: '#133820', // Dark Forest Green for dark sections/footer
          dark: '#0E2917',
        },
        heading: '#2C1810',
        bodytext: '#52433B',
        bordercolor: '#EFE6DD',
        background: {
          light: '#FDFBF7', // Warm Cream
          dark: '#133820',
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

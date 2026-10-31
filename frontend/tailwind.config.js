/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          dark: '#818cf8',
          light: '#a5b4fc',
        },
        sidebar: {
          dark: '#0f172a',
          light: '#f8fafc',
        },
      },
      spacing: {
        headerHeight: '80px',
        sectionPadding: '4rem',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Source Sans Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


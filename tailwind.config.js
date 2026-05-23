/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // vibrant blue
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        secondary: {
          DEFAULT: '#10B981', // green for success
          hover: '#059669',
        },
        accent: {
          DEFAULT: '#06B6D4', // cyan for accents
          hover: '#0891B2',
        },
        background: '#F8FAFC', // light slate
        surface: '#FFFFFF', // white
        sidebar: '#FFFFFF', // white
        text: {
          main: '#0F172A', // dark slate
          muted: '#64748B', // muted slate
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}

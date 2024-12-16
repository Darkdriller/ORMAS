/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E7E9EF',
          100: '#C2C9D6',
          200: '#9BA6BD',
          300: '#7483A4',
          400: '#576A8E',
          500: '#3A5078',
          600: '#334870',
          700: '#2B3D65',
          800: '#23335B',
          900: '#1B2847',
        },
      },
    },
  },
  plugins: [],
};
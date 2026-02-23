/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ice: '#cadbfc',
          blush: '#feecf5',
          lilac: '#f9eafe',
          orchid: '#ebbcfc',
          punch: '#ff0061',
        },
      },
    },
  },
  plugins: [],
};

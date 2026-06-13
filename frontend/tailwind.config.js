/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens backed by CSS variables that flip under `.dark`.
        // The `rgb(var(--c-x) / <alpha-value>)` form keeps `/opacity` modifiers working.
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        brand: {
          ice: 'rgb(var(--c-ice) / <alpha-value>)',
          blush: 'rgb(var(--c-blush) / <alpha-value>)',
          lilac: 'rgb(var(--c-lilac) / <alpha-value>)',
          orchid: 'rgb(var(--c-orchid) / <alpha-value>)',
          punch: 'rgb(var(--c-punch) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

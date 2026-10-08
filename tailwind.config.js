/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#F5F1E8',
        surface: '#FBF9F4',
        panel: '#EEF0E8',
        card: '#FFFDF8',
        burgundy: '#DCE9E3',
        crimson: '#0F766E',
        signal: '#0F766E',
        softred: '#B45309',
        warm: '#17211F',
        muted: '#68736E',
        border: '#D7DED6',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 14px 30px rgba(39, 69, 60, 0.08)',
        signal: '0 0 0 1px rgba(15, 118, 110, 0.22)',
      },
    },
  },
  plugins: [],
}

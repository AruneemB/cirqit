/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00D9FF',
        secondary: '#A78BFA',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        bg: '#0A0F1E',
        surface: 'rgba(26, 31, 53, 0.6)',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

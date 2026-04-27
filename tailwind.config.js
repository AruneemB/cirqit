/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:          '#5A31F4',
        accent:           '#8A64FF',
        glow:             '#B48EFF',
        'violet-soft':    '#C6B5FF',
        bg:               '#2A1B4A',
        panel:            '#1E1534',
        glass:            'rgba(255,255,255,0.06)',
        'text-primary':   '#E9E4FF',
        'text-secondary': '#A89DC8',
        success:          '#34D399',
        warning:          '#FBBF24',
        error:            '#F87171',
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

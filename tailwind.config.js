/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cosmic Pulse Palette
        'cosmic-black': '#0d0f1f',
        'galactic-indigo': '#6c63ff',
        'nebula-green': '#00ffd0',
        'supernova-pink': '#ff61a6',
        'moon-dust': '#b0b3c5',
        'satellite-gray': '#1f2335',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0d0f1f 0%, #1f2335 50%, #6c63ff 100%)',
        'nebula-gradient': 'linear-gradient(135deg, #6c63ff 0%, #00ffd0 100%)',
        'supernova-gradient': 'linear-gradient(135deg, #ff61a6 0%, #6c63ff 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(108, 99, 255, 0.8)' },
        },
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#b0b3c5',
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-lead': '#b0b3c5',
            '--tw-prose-links': '#00ffd0',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-counters': '#b0b3c5',
            '--tw-prose-bullets': '#6c63ff',
            '--tw-prose-hr': '#1f2335',
            '--tw-prose-quotes': '#b0b3c5',
            '--tw-prose-quote-borders': '#6c63ff',
            '--tw-prose-captions': '#b0b3c5',
            '--tw-prose-code': '#00ffd0',
            '--tw-prose-pre-code': '#b0b3c5',
            '--tw-prose-pre-bg': '#1f2335',
            '--tw-prose-th-borders': '#1f2335',
            '--tw-prose-td-borders': '#1f2335',
          },
        },
      },
    },
  },
  plugins: [],
};
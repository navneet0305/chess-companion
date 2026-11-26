/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chess: {
          bg: '#0f0f0f',
          panel: '#1a1a1a',
          surface: '#242424',
          hover: '#2a2a2a',
          border: '#2a2a2a',
          'border-active': '#3a3a3a',
          accent: '#86efac',
          'accent-dim': '#4ade80',
          'accent-dark': '#22c55e',
          'light-square': '#e8d5b5',
          'dark-square': '#b48866',
          'light-square-highlight': '#f0e4a0',
          'dark-square-highlight': '#d4a84a',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          brilliant: '#1baceb',
          best: '#96bc4b',
          excellent: '#96bc4b',
          good: '#96bc4b',
          inaccuracy: '#f7c631',
          mistake: '#e69420',
          blunder: '#ca3232',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'piece-move': 'pieceMove 0.15s ease-out',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pieceMove: {
          from: { transform: 'scale(1.1)' },
          to: { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

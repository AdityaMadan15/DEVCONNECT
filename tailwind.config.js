/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f0f0f5',
          100: '#d9d9e8',
          200: '#b3b3d1',
          300: '#8c8cba',
          400: '#6666a3',
          500: '#40408c',
          600: '#333375',
          700: '#26265e',
          800: '#1a1a47',
          900: '#0d0d2b',
          950: '#07071a',
        },
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card:    '#14141f',
          hover:   '#1c1c2e',
          border:  '#2a2a45',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(34,211,238,0.25)',
        'glow':     '0 0 20px rgba(34,211,238,0.35)',
        'glow-lg':  '0 0 40px rgba(34,211,238,0.45)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.55)',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-down':   'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0)    scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(99,102,241,0.5)' },
        },
      },
    },
  },
  plugins: [],
}

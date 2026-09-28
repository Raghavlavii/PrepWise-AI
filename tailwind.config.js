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
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7c3aed',
          600: '#6366f1',
          700: '#4f46e5',
          800: '#4338ca',
          900: '#3730a3',
        },
        magenta: {
          400: '#e879f9',
          500: '#c026d3',
          600: '#a21caf',
        },
        surface: {
          0: '#07070d',
          1: '#0d0b14',
          2: '#13101e',
          3: '#1a1628',
          4: '#221d35',
        },
        nexis: {
          yellow: '#FFC700',
          dark: '#0B0B0C',
          card: '#161618',
          light: '#F4F4F6'
        },
        lavender: {
          200: '#e0e7ff',
          300: '#c7d2fe',
          400: '#a5b4fc',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 12px 2px rgba(124,58,237,0.25)',
        'glow-md': '0 0 24px 4px rgba(124,58,237,0.35)',
        'glow-lg': '0 0 48px 8px rgba(124,58,237,0.4)',
        'glow-magenta': '0 0 24px 4px rgba(192,38,211,0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(124,58,237,0.2)',
        'btn': '0 4px 0px rgba(124,58,237,0.6), 0 0 16px rgba(124,58,237,0.3)',
        'btn-press': '0 1px 0px rgba(124,58,237,0.6)',
        'inset-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #c026d3 100%)',
        'brand-gradient-r': 'linear-gradient(225deg, #6366f1 0%, #7c3aed 50%, #c026d3 100%)',
        'surface-gradient': 'radial-gradient(ellipse at top, #1a1628 0%, #07070d 70%)',
        'hero-glow': 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 70%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 0.8s ease-out',
        'pop': 'pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ripple': 'ripple 1s ease-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 32px rgba(124,58,237,0.8), 0 0 48px rgba(192,38,211,0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
